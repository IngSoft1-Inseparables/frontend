import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import GenericButton from "./GenericButton";

describe("GenericButton", () => {
  it("renderiza el texto del botón", () => {
    render(
      <GenericButton nameButton="Crear partida" functionClick={() => {}} />
    );
    expect(screen.getByText("Crear partida")).toBeInTheDocument();
  });

  it("ejecuta la función cuando se hace click", async () => {
    const mockFn = vi.fn();

    render(
      <GenericButton nameButton="Botón genérico" functionClick={mockFn} />
    );

    const button = screen.getByRole("button", { name: "Botón genérico" });
    await userEvent.click(button);

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it("agrega la clase extra si se pasa por props", () => {
    render(
      <GenericButton
        nameButton="Test"
        functionClick={() => {}}
        className="extra-class"
      />
    );
    const button = screen.getByRole("button", { name: "Test" });

    expect(button).toHaveClass("extra-class");
  });
  it("usa type='button' por defecto si no se pasa nada", () => {
    render(<GenericButton nameButton="Click me" functionClick={() => {}} />);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toHaveAttribute("type", "button");
  });

  it("usa el type que se pasa por prop", () => {
    render(
      <GenericButton
        nameButton="Submit me"
        functionClick={() => {}}
        type="submit"
      />
    );
    const button = screen.getByRole("button", { name: "Submit me" });
    expect(button).toHaveAttribute("type", "submit");
  });
  it("deshabilita el botón si se pasa la prop disabled", () => {
  render(
    <GenericButton
      nameButton="No clickeable"
      functionClick={() => {}}
      disabled={true}
    />
  );

  const button = screen.getByRole("button", { name: "No clickeable" });
  expect(button).toBeDisabled();
});

it("está habilitado por defecto si no se pasa disabled", () => {
  render(
    <GenericButton nameButton="Clickeable" functionClick={() => {}} />
  );

  const button = screen.getByRole("button", { name: "Clickeable" });
  expect(button).toBeEnabled();
});
});
