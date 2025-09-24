import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { UserMenu } from "../UserMenu";
import { getUserInfo, logout } from "../../../../lib/api";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock API functions
jest.mock("../../../../lib/api", () => ({
  getUserInfo: jest.fn(),
  logout: jest.fn(),
}));

// Mock Lucide React icons
jest.mock("lucide-react", () => ({
  User: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props} />
  ),
  Settings: ({ className, ...props }: any) => (
    <div data-testid="settings-icon" className={className} {...props} />
  ),
  LogOut: ({ className, ...props }: any) => (
    <div data-testid="logout-icon" className={className} {...props} />
  ),
  ChevronDown: ({ className, ...props }: any) => (
    <div data-testid="chevron-down-icon" className={className} {...props} />
  ),
  Shield: ({ className, ...props }: any) => (
    <div data-testid="shield-icon" className={className} {...props} />
  ),
  HelpCircle: ({ className, ...props }: any) => (
    <div data-testid="help-circle-icon" className={className} {...props} />
  ),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

const mockUserInfo = {
  username: "testuser",
  is_admin: true,
};

describe("UserMenu Component", () => {
  const mockOnToggle = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (getUserInfo as jest.Mock).mockReturnValue(mockUserInfo);
  });

  describe("Basic Rendering", () => {
    it("renders user menu button", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText("User menu")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("shows user avatar with first letter of username", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("T")).toBeInTheDocument(); // First letter of "testuser"
    });

    it("shows dropdown menu when isOpen is true", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Help & Support")).toBeInTheDocument();
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });

    it("does not show dropdown menu when isOpen is false", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText("Profile")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
    });
  });

  describe("User Information Display", () => {
    it("displays username correctly", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      expect(screen.getByText("testuser")).toBeInTheDocument();
    });

    it("shows admin badge for admin users", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    });

    it("does not show admin badge for non-admin users", () => {
      (getUserInfo as jest.Mock).mockReturnValue({
        username: "regularuser",
        is_admin: false,
      });

      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
      expect(screen.queryByTestId("shield-icon")).not.toBeInTheDocument();
    });

    it("handles missing user info gracefully", () => {
      (getUserInfo as jest.Mock).mockReturnValue(null);

      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("U")).toBeInTheDocument(); // Default avatar
    });

    it("handles empty username gracefully", () => {
      (getUserInfo as jest.Mock).mockReturnValue({
        username: "",
        is_admin: false,
      });

      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("U")).toBeInTheDocument(); // Default avatar
    });
  });

  describe("User Interactions", () => {
    it("calls onToggle when menu button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      const menuButton = screen.getByLabelText("User menu");
      await user.click(menuButton);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("navigates to profile page when Profile is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const profileButton = screen.getByText("Profile");
      await user.click(profileButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/profile");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("navigates to settings page when Settings is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const settingsButton = screen.getByText("Settings");
      await user.click(settingsButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/settings");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("navigates to help page when Help & Support is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const helpButton = screen.getByText("Help & Support");
      await user.click(helpButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/admin/help");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("logs out and redirects when Sign out is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const signOutButton = screen.getByText("Sign out");
      await user.click(signOutButton);

      expect(logout).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("Visual States", () => {
    it("shows chevron down icon in correct rotation when closed", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      const chevronIcon = screen.getByTestId("chevron-down-icon");
      expect(chevronIcon).not.toHaveClass("rotate-180");
    });

    it("shows chevron down icon rotated when open", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const chevronIcon = screen.getByTestId("chevron-down-icon");
      expect(chevronIcon).toHaveClass("rotate-180");
    });

    it("applies correct styling to menu items", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const profileButton = screen.getByText("Profile");
      expect(profileButton).toHaveClass(
        "w-full",
        "flex",
        "items-center",
        "space-x-3",
        "px-3",
        "py-2",
        "text-sm",
        "transition-colors"
      );
    });

    it("applies danger styling to sign out button", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const signOutButton = screen.getByText("Sign out");
      expect(signOutButton).toHaveClass("text-red-600", "dark:text-red-400");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      const menuButton = screen.getByLabelText("User menu");
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
      expect(menuButton).toHaveAttribute("aria-haspopup", "true");
    });

    it("updates ARIA expanded when menu is open", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const menuButton = screen.getByLabelText("User menu");
      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });

    it("has proper button roles for menu items", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const profileButton = screen.getByText("Profile");
      expect(profileButton.tagName).toBe("BUTTON");

      const settingsButton = screen.getByText("Settings");
      expect(settingsButton.tagName).toBe("BUTTON");

      const signOutButton = screen.getByText("Sign out");
      expect(signOutButton.tagName).toBe("BUTTON");
    });
  });

  describe("Responsive Design", () => {
    it("hides username on small screens", () => {
      render(
        <UserMenu
          isOpen={false}
          onToggle={mockOnToggle}
          onClose={mockOnClose}
        />
      );

      const username = screen.getByText("testuser");
      expect(username).toHaveClass("hidden", "sm:block");
    });

    it("applies correct positioning and sizing classes", () => {
      const { container } = render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const dropdown = container.querySelector(".absolute.right-0.mt-2.w-56");
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe("Menu Structure", () => {
    it("renders all menu icons correctly", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByTestId("settings-icon")).toBeInTheDocument();
      expect(screen.getByTestId("help-circle-icon")).toBeInTheDocument();
      expect(screen.getByTestId("logout-icon")).toBeInTheDocument();
    });

    it("has proper menu structure with separators", () => {
      const { container } = render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const separators = container.querySelectorAll("hr");
      expect(separators).toHaveLength(1); // One separator before logout
    });

    it("groups menu items correctly", () => {
      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      // User info should be at the top
      const userInfo = screen.getByText("testuser");
      expect(userInfo).toBeInTheDocument();

      // Regular menu items
      expect(screen.getByText("Profile")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Help & Support")).toBeInTheDocument();

      // Logout should be separated
      expect(screen.getByText("Sign out")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles router errors gracefully", async () => {
      const user = userEvent.setup();
      mockRouter.push.mockRejectedValue(new Error("Navigation failed"));

      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const profileButton = screen.getByText("Profile");
      await user.click(profileButton);

      // Should still call onClose even if navigation fails
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles logout errors gracefully", async () => {
      const user = userEvent.setup();
      (logout as jest.Mock).mockImplementation(() => {
        throw new Error("Logout failed");
      });

      render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const signOutButton = screen.getByText("Sign out");

      // Should not throw error
      await user.click(signOutButton);

      expect(logout).toHaveBeenCalledTimes(1);
    });
  });

  describe("Theme Support", () => {
    it("applies dark mode classes correctly", () => {
      const { container } = render(
        <UserMenu isOpen={true} onToggle={mockOnToggle} onClose={mockOnClose} />
      );

      const dropdown = container.querySelector(".dark\\:bg-gray-800");
      expect(dropdown).toBeInTheDocument();

      const menuItems = container.querySelectorAll(".dark\\:text-gray-300");
      expect(menuItems.length).toBeGreaterThan(0);
    });
  });
});
