from typing import List

from fastapi import APIRouter, Depends, HTTPException

from core import (
    PortfolioCreate,
    PortfolioItem,
    PortfolioUpdate,
    get_current_admin,
    get_db_connection,
)


router = APIRouter()


@router.get("/api/portfolio", response_model=List[PortfolioItem])
async def get_portfolio():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM portfolio ORDER BY created_at DESC"
        cursor.execute(query)
        portfolio_items = cursor.fetchall()
        return portfolio_items
    finally:
        cursor.close()
        connection.close()


@router.post("/api/portfolio", response_model=dict)
async def create_portfolio_item(
    portfolio: PortfolioCreate, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
        INSERT INTO portfolio (title, description, technologies, project_url, github_url, image_url, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(
            query,
            (
                portfolio.title,
                portfolio.description,
                portfolio.technologies,
                portfolio.project_url,
                portfolio.github_url,
                portfolio.image_url,
            ),
        )
        connection.commit()
        portfolio_id = cursor.lastrowid

        return {"message": "Portfolio item created successfully", "id": portfolio_id}
    finally:
        cursor.close()
        connection.close()


@router.put("/api/portfolio/{portfolio_id}", response_model=dict)
async def update_portfolio_item(
    portfolio_id: int,
    portfolio: PortfolioUpdate,
    admin_id: int = Depends(get_current_admin),
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Build dynamic update query based on provided fields
        update_fields = []
        update_values = []

        if portfolio.title is not None:
            update_fields.append("title = %s")
            update_values.append(portfolio.title)
        if portfolio.description is not None:
            update_fields.append("description = %s")
            update_values.append(portfolio.description)
        if portfolio.technologies is not None:
            update_fields.append("technologies = %s")
            update_values.append(portfolio.technologies)
        if portfolio.project_url is not None:
            update_fields.append("project_url = %s")
            update_values.append(portfolio.project_url)
        if portfolio.github_url is not None:
            update_fields.append("github_url = %s")
            update_values.append(portfolio.github_url)
        if portfolio.image_url is not None:
            update_fields.append("image_url = %s")
            update_values.append(portfolio.image_url)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = NOW()")
        update_values.append(portfolio_id)

        query = f"UPDATE portfolio SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Portfolio item not found")

        connection.commit()
        return {"message": "Portfolio item updated successfully"}
    finally:
        cursor.close()
        connection.close()


@router.delete("/api/portfolio/{portfolio_id}")
async def delete_portfolio_item(
    portfolio_id: int, admin_id: int = Depends(get_current_admin)
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("DELETE FROM portfolio WHERE id = %s", (portfolio_id,))

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Portfolio item not found")

        connection.commit()
        return {"message": "Portfolio item deleted successfully"}
    finally:
        cursor.close()
        connection.close()
