from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from core import (
    Product,
    ProductCreate,
    ProductImage,
    ProductInquiry,
    ProductUpdate,
    get_current_admin,
    get_db_connection,
)
from routers.uploads import upload_media


router = APIRouter()


# Product API endpoints
@router.get("/api/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, limit: int = 20):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        if category and category != "all":
            query = "SELECT * FROM products WHERE category = %s AND is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (category, limit))
        else:
            query = "SELECT * FROM products WHERE is_active = TRUE ORDER BY created_at DESC LIMIT %s"
            cursor.execute(query, (limit,))

        products = cursor.fetchall()

        # Fetch images for each product
        products_with_images = []
        for product in products:
            # Fetch images for this product, ordered by primary first
            cursor.execute(
                "SELECT id, image_url, is_primary FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
                (product["id"],),
            )
            images = cursor.fetchall()
            image_urls = [img["image_url"] for img in images] if images else []

            # Create product dict with images
            product_dict = dict(product)
            product_dict["image_urls"] = image_urls
            product_dict["images"] = [ProductImage(**img) for img in images]

            products_with_images.append(product_dict)

        return products_with_images
    finally:
        cursor.close()
        connection.close()


@router.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM products WHERE id = %s"
        cursor.execute(query, (product_id,))
        product_data = cursor.fetchone()

        if not product_data:
            raise HTTPException(status_code=404, detail="Product not found")

        # Fetch additional images for this product, ordered by primary first
        cursor.execute(
            "SELECT id, image_url, is_primary FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        image_urls = [img["image_url"] for img in images] if images else []

        # Construct the Product model instance
        product = Product(
            id=product_data["id"],
            name=product_data["name"],
            description=product_data["description"],
            category=product_data["category"],
            price=product_data["price"],
            stock=product_data["stock"],
            discount=product_data["discount"],
            specifications=product_data["specifications"],
            image_urls=image_urls,  # Use the fetched image_urls
            images=[ProductImage(**img) for img in images],  # Full image objects
            is_active=product_data["is_active"],
            created_at=product_data["created_at"],
            updated_at=product_data["updated_at"],
            created_by=product_data["created_by"],
        )

        # Add images array to the response for frontend gallery
        product_dict = product.dict()
        product_dict["images"] = images  # Include detailed image info

        return product_dict
    finally:
        cursor.close()
        connection.close()


@router.post("/api/products", response_model=dict)
async def create_product(
    product: ProductCreate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Validation: Check if at least one image is provided
        if not product.image_urls or len(product.image_urls) == 0:
            raise HTTPException(
                status_code=400, detail="At least one product image is required"
            )

        # Validate image URLs
        for i, url in enumerate(product.image_urls):
            if not url or not url.strip():
                raise HTTPException(
                    status_code=400,
                    detail=f"Image URL at position {i + 1} is empty or invalid",
                )

        # Start transaction
        connection.start_transaction()

        query = """
        INSERT INTO products (name, description, category, price, stock, discount, specifications, is_active, created_by, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                product.name,
                product.description,
                product.category,
                product.price,
                product.stock,
                product.discount,
                product.specifications,
                product.is_active,
                admin_id,
            ),
        )
        product_id = cursor.lastrowid

        # Insert images into product_images table
        image_records = []
        for i, url in enumerate(product.image_urls):
            # First image is primary, others are not
            is_primary = i == 0
            image_records.append((product_id, url, is_primary))

        cursor.executemany(
            """
            INSERT INTO product_images (product_id, image_url, is_primary, created_at)
            VALUES (%s, %s, %s, NOW())
            """,
            image_records,
        )

        # Commit transaction
        connection.commit()

        return {
            "message": "Product created successfully",
            "id": product_id,
            "images_saved": len(product.image_urls),
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        connection.rollback()
        raise
    except Exception as e:
        # Handle database errors
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to create product: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@router.put("/api/products/{product_id}", response_model=dict)
async def update_product(
    product_id: int, product: ProductUpdate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        connection.start_transaction()
        # Build dynamic update query
        update_fields = []
        update_values = []

        if product.name is not None:
            update_fields.append("name = %s")
            update_values.append(product.name)
        if product.description is not None:
            update_fields.append("description = %s")
            update_values.append(product.description)
        if product.category is not None:
            update_fields.append("category = %s")
            update_values.append(product.category)
        if product.price is not None:
            update_fields.append("price = %s")
            update_values.append(product.price)
        if product.stock is not None:
            update_fields.append("stock = %s")
            update_values.append(product.stock)
        if product.discount is not None:
            update_fields.append("discount = %s")
            update_values.append(product.discount)
        if product.specifications is not None:
            update_fields.append("specifications = %s")
            update_values.append(product.specifications)
        if product.image_urls is not None:
            if len(product.image_urls) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="At least one product image is required",
                )
            update_fields.append("image_url = %s")
            update_values.append(product.image_urls[0])
        elif product.image_url is not None:
            update_fields.append("image_url = %s")
            update_values.append(product.image_url)
        if product.is_active is not None:
            update_fields.append("is_active = %s")
            update_values.append(product.is_active)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = NOW()")
        update_values.append(product_id)

        query = f"UPDATE products SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        if product.image_urls is not None:
            cursor.execute(
                "DELETE FROM product_images WHERE product_id = %s", (product_id,)
            )

            image_records = []
            for i, url in enumerate(product.image_urls):
                is_primary = i == 0
                image_records.append((product_id, url, is_primary))

            cursor.executemany(
                """
                INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                VALUES (%s, %s, %s, NOW())
                """,
                image_records,
            )

        connection.commit()
        return {"message": "Product updated successfully"}
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update product: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()


@router.delete("/api/products/{product_id}")
async def delete_product(product_id: int, admin_id: int = Depends(get_current_admin)):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Delete related inquiries first
        cursor.execute(
            "DELETE FROM product_inquiries WHERE product_id = %s", (product_id,)
        )

        # Delete the product
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Product not found")

        connection.commit()
        return {"message": "Product deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@router.post("/api/products/{product_id}/inquire")
async def create_product_inquiry(
    product_id: int, inquiry: ProductInquiry, request: Request
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        query = """
        INSERT INTO product_inquiries (product_id, customer_name, customer_email, customer_phone, message, inquiry_type, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(
            query,
            (
                product_id,
                inquiry.customer_name,
                inquiry.customer_email,
                inquiry.customer_phone,
                inquiry.message,
                inquiry.inquiry_type,
            ),
        )
        connection.commit()

        return {"message": "Inquiry submitted successfully", "id": cursor.lastrowid}
    finally:
        cursor.close()
        connection.close()


# Product Images API endpoints
@router.post("/api/products/{product_id}/images")
async def add_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check if product exists
        cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")

        # Upload images
        uploaded_files = await upload_media(files, admin_id)

        # Prepare bulk insert
        image_records = [
            (product_id, f["url"], False)
            for f in uploaded_files["uploaded_files"]
            if f["type"] == "image"
        ]

        if image_records:
            cursor.executemany(
                """
                INSERT INTO product_images (product_id, image_url, is_primary, created_at)
                VALUES (%s, %s, %s, NOW())
                ON DUPLICATE KEY UPDATE updated_at = NOW()
                """,
                image_records,
            )
            connection.commit()

            cursor.execute(
                """
                SELECT id, image_url, is_primary, created_at
                FROM product_images
                WHERE product_id = %s
                ORDER BY is_primary DESC, id DESC
                LIMIT %s
                """,
                (product_id, len(image_records)),
            )
            added_images = cursor.fetchall()
        else:
            added_images = []

        return {
            "message": f"Added {len(added_images)} images successfully",
            "images": added_images,
        }

    finally:
        cursor.close()
        connection.close()


@router.delete("/api/products/{product_id}/images/{image_id}")
async def delete_product_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT image_url FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        image = cursor.fetchone()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        # Delete from database
        cursor.execute("DELETE FROM product_images WHERE id = %s", (image_id,))
        connection.commit()

        return {"message": "Image deleted successfully"}
    finally:
        cursor.close()
        connection.close()


@router.put("/api/products/{product_id}/images/{image_id}/primary")
async def set_primary_image(
    product_id: int, image_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Check if image exists and belongs to the product
        cursor.execute(
            "SELECT id FROM product_images WHERE id = %s AND product_id = %s",
            (image_id, product_id),
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Image not found")

        # Remove primary status from all images of this product
        cursor.execute(
            "UPDATE product_images SET is_primary = FALSE WHERE product_id = %s",
            (product_id,),
        )

        # Set this image as primary
        cursor.execute(
            "UPDATE product_images SET is_primary = TRUE WHERE id = %s", (image_id,)
        )

        connection.commit()
        return {"message": "Primary image updated successfully"}
    finally:
        cursor.close()
        connection.close()


@router.get("/api/products/{product_id}/images")
async def get_product_images(product_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, image_url, is_primary, created_at FROM product_images WHERE product_id = %s ORDER BY is_primary DESC, id ASC",
            (product_id,),
        )
        images = cursor.fetchall()
        return images
    finally:
        cursor.close()
        connection.close()
