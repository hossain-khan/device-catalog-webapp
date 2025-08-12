import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme, ThemeProvider } from "next-themes";
import { vi } from 'vitest';

// Mock the useTheme hook
vi.mock("next-themes", async () => {
    const actual = await vi.importActual("next-themes") as object;
    return {
        ...actual,
        useTheme: vi.fn(),
    };
});

describe("ThemeToggle", () => {
  let setTheme: (theme: string) => void;

  beforeEach(() => {
    setTheme = vi.fn();
    (useTheme as jest.Mock).mockReturnValue({ setTheme });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {component}
      </ThemeProvider>
    );
  };

  it("should render the toggle button", () => {
    renderWithProvider(<ThemeToggle />);
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it("should open the dropdown menu when the button is clicked", async () => {
    renderWithProvider(<ThemeToggle />);
    const user = userEvent.setup();
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(await screen.findByRole("menuitem", { name: "Light" })).toBeInTheDocument();
    expect(await screen.findByRole("menuitem", { name: "Dark" })).toBeInTheDocument();
    expect(await screen.findByRole("menuitem", { name: "System" })).toBeInTheDocument();
  });

  it('should call setTheme with "light" when the Light menu item is clicked', async () => {
    renderWithProvider(<ThemeToggle />);
    const user = userEvent.setup();
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleButton);

    const lightMenuItem = await screen.findByRole("menuitem", { name: "Light" });
    await user.click(lightMenuItem);

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it('should call setTheme with "dark" when the Dark menu item is clicked', async () => {
    renderWithProvider(<ThemeToggle />);
    const user = userEvent.setup();
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleButton);

    const darkMenuItem = await screen.findByRole("menuitem", { name: "Dark" });
    await user.click(darkMenuItem);

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it('should call setTheme with "system" when the System menu item is clicked', async () => {
    renderWithProvider(<ThemeToggle />);
    const user = userEvent.setup();
    const toggleButton = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(toggleButton);

    const systemMenuItem = await screen.findByRole("menuitem", { name: "System" });
    await user.click(systemMenuItem);

    expect(setTheme).toHaveBeenCalledWith("system");
  });
});
