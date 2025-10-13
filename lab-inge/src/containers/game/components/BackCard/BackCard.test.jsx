import { render, screen, fireEvent } from "@testing-library/react";
import BackCard from "./BackCard.jsx";
import "@testing-library/jest-dom";
import { describe, test, expect } from "vitest";

describe("BackCard", () => {
  test("todas las cartas están apiladas con transform", () => {
    const deck = [
      { id: 1, back: "/cards/back1.png", alt: "card1" },
      { id: 2, back: "/cards/back1.png", alt: "card2" },
      { id: 3, back: "/cards/back1.png", alt: "card3" },
    ];
    render(<BackCard type="regular" deck={deck} />);
    const imgs = screen.getAllByRole("img");
    imgs.forEach((img, idx) => {
      expect(img).toHaveStyle(`transform: translateY(-${idx * 2}px)`);
    });
  });

  test("la última carta tiene la clase back-card-clickable solo si available es true", () => {
    const deck = [
      { id: 1, back: "/cards/back1.png", alt: "card1" },
      { id: 2, back: "/cards/back1.png", alt: "card2" },
    ];
    // available true
    render(<BackCard type="regular" deck={deck} available={true} />);
    const imgsTrue = screen.getAllByRole("img");
    expect(imgsTrue[imgsTrue.length - 1]).toHaveClass("back-card-clickable");

    // available false
    render(<BackCard type="regular" deck={deck} available={false} />);
    const imgsFalse = screen.getAllByRole("img");
    expect(imgsFalse[imgsFalse.length - 1]).not.toHaveClass(
      "back-card-clickable"
    );
  });

  test("la última carta es clickeable solo si available es true", () => {
    const deck = [
      { id: 1, back: "/cards/back1.png", alt: "card1" },
      { id: 2, back: "/cards/back1.png", alt: "card2" },
    ];

    // available true
    const { container: containerTrue } = render(
      <BackCard type="regular" deck={deck} available={true} />
    );
    const lastCardTrue = containerTrue.querySelector(".back-card:last-child");
    expect(lastCardTrue).toHaveClass("back-card-clickable");

    // available false
    const { container: containerFalse } = render(
      <BackCard type="regular" deck={deck} available={false} />
    );
    const lastCardFalse = containerFalse.querySelector(".back-card:last-child");
    expect(lastCardFalse).not.toHaveClass("back-card-clickable");
  });

  test('renderiza todas las cartas con el dorso cuando type="regular"', () => {
    const deck = [
      {
        id: 1,
        back: "/cards/back1.png",
        face: "/cards/front1.png",
        alt: "card1",
      },
      {
        id: 2,
        back: "/cards/back1.png",
        face: "/cards/front2.png",
        alt: "card2",
      },
    ];

    render(<BackCard type="regular" deck={deck} />);

    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("src", "/cards/back1.png");
    });
  });

  test('reemplaza la primera carta por Murder Escapes cuando type="regular"', () => {
    const deck = [
      { id: 1, back: '/cards/back1.png', face: '/cards/front1.png', alt: 'card1' },
      { id: 2, back: '/cards/back2.png', face: '/cards/front2.png', alt: 'card2' }
    ]

    render(<BackCard type="regular" deck={deck} />)

    const firstCard = screen.getAllByRole('img')[0]
    expect(firstCard).toHaveAttribute('src', '/cards/02-murder_escapes.png')
    expect(firstCard).toHaveAttribute('alt', 'MurderEscapes')
  })

  test('renderiza la última carta boca arriba cuando type="discard"', () => {
    const deck = [
      {
        id: 1,
        back: "/cards/back1.png",
        face: "/cards/front1.png",
        alt: "card1",
      },
      {
        id: 2,
        back: "/cards/back1.png",
        face: "/cards/front2.png",
        alt: "card2",
      },
    ];

    render(<BackCard type="discard" deck={deck} />);

    const imgs = screen.getAllByRole("img");
    expect(imgs).toHaveLength(2);

    const lastCard = imgs[imgs.length - 1];
    expect(lastCard).toHaveAttribute("src", "/cards/front2.png");
  });

  test("no renderiza nada si el deck está vacío", () => {
    render(<BackCard type="regular" deck={[]} />);
    const imgs = screen.queryAllByRole("img");
    expect(imgs).toHaveLength(0);
  });

  test("no renderiza nada si no se pasa deck", () => {
    render(<BackCard type="regular" />);
    const imgs = screen.queryAllByRole("img");
    expect(imgs).toHaveLength(0);
  });
  test("handleClick se ejecuta al clickear la última carta si available es true", () => {
    const deck = [
      { id: 1, back: "/cards/back1.png", alt: "card1" },
      { id: 2, back: "/cards/back2.png", alt: "card2" },
    ];

    const onCardClickMock = vi.fn();
    render(
      <BackCard
        type="regular"
        deck={deck}
        available={true}
        onCardClick={onCardClickMock}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1); // solo la última carta es botón

    fireEvent.click(buttons[0]); // hacemos click en la carta clickeable

    expect(onCardClickMock).toHaveBeenCalledTimes(1); // se llamó a onCardClick
  });

  test("no se ejecuta handleClick si available es false", () => {
    const deck = [
      { id: 1, back: "/cards/back1.png", alt: "card1" },
      { id: 2, back: "/cards/back2.png", alt: "card2" },
    ];

    const onCardClickMock = vi.fn();
    render(
      <BackCard
        type="regular"
        deck={deck}
        available={false}
        onCardClick={onCardClickMock}
      />
    );

    // Obtenemos la última carta
    const imgs = screen.getAllByRole("img");
    const lastCard = imgs[imgs.length - 1];

    // Simulamos click
    lastCard.click();

    // Esperamos que la función no haya sido llamada
    expect(onCardClickMock).not.toHaveBeenCalled();
  });
});
