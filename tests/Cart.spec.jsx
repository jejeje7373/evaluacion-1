import React from 'react';
import Cart from '../src/components/Cart.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente Cart (Pruebas Unitarias de Carrito, Cupones y Totales)', () => {
  let container;
  let mockItems;
  let mockOnUpdateQuantity;
  let mockOnRemoveItem;
  let mockOnClearCart;
  let mockOnContinueShopping;

  beforeEach(() => {
    container = setupTestContainer();

    mockItems = [
      {
        codigo: 'FR001',
        nombre: 'Manzanas Fuji',
        precio: 1200,
        unidad: 'kilo',
        cantidad: 2,
        imagen: 'assets/img/manzanas.svg'
      },
      {
        codigo: 'PO001',
        nombre: 'Miel Orgánica',
        precio: 5000,
        unidad: 'frasco 500g',
        cantidad: 1,
        imagen: 'assets/img/miel.svg'
      }
    ];

    mockOnUpdateQuantity = jasmine.createSpy('onUpdateQuantity');
    mockOnRemoveItem = jasmine.createSpy('onRemoveItem');
    mockOnClearCart = jasmine.createSpy('onClearCart');
    mockOnContinueShopping = jasmine.createSpy('onContinueShopping');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar la vista de carrito vacío cuando no hay ítems', () => {
    render(
      <Cart 
        cartItems={[]} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const emptyView = container.querySelector('[data-testid="empty-cart-view"]');
    expect(emptyView).not.toBeNull();
    expect(emptyView.textContent).toContain('Tu carrito está vacío');
  });

  it('2. Debe renderizar la lista de productos y calcular subtotales correctamente en el DOM', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const rowFR001 = container.querySelector('[data-testid="cart-row-FR001"]');
    const rowPO001 = container.querySelector('[data-testid="cart-row-PO001"]');
    expect(rowFR001).not.toBeNull();
    expect(rowPO001).not.toBeNull();

    // Subtotal FR001: 1200 * 2 = 2400
    const subtotalFR001 = container.querySelector('[data-testid="cart-subtotal-FR001"]');
    expect(subtotalFR001.textContent).toContain('2.400');

    // Subtotal PO001: 5000 * 1 = 5000
    const subtotalPO001 = container.querySelector('[data-testid="cart-subtotal-PO001"]');
    expect(subtotalPO001.textContent).toContain('5.000');

    // Subtotal global: 2400 + 5000 = 7400
    const summarySubtotal = container.querySelector('[data-testid="summary-subtotal"]');
    expect(summarySubtotal.textContent).toContain('7.400');
  });

  it('3. Debe invocar onUpdateQuantity con la nueva cantidad al pulsar los botones + y -', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const btnInc = container.querySelector('[data-testid="cart-inc-FR001"]');
    const btnDec = container.querySelector('[data-testid="cart-dec-FR001"]');

    fireClick(btnInc);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('FR001', 3);

    fireClick(btnDec);
    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('FR001', 1);
  });

  it('4. Debe invocar onRemoveItem al hacer clic en el botón de eliminar', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const btnRemove = container.querySelector('[data-testid="cart-remove-PO001"]');
    fireClick(btnRemove);

    expect(mockOnRemoveItem).toHaveBeenCalledWith('PO001');
  });

  it('5. Debe aplicar correctamente el cupón de descuento HOGAR10 (10%) y actualizar el total', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const couponInput = container.querySelector('[data-testid="coupon-input"]');
    const couponForm = container.querySelector('[data-testid="coupon-form"]');

    fireChange(couponInput, 'HOGAR10');
    fireSubmit(couponForm);

    const feedback = container.querySelector('[data-testid="coupon-feedback"]');
    expect(feedback).not.toBeNull();
    expect(feedback.textContent).toContain('Descuento del 10%');

    // Subtotal: 7400 -> Descuento 10%: 740 -> Despacho < 20000: 2500 -> Total: 7400 - 740 + 2500 = 9160
    const discountEl = container.querySelector('[data-testid="summary-discount"]');
    expect(discountEl.textContent).toContain('740');

    const totalEl = container.querySelector('[data-testid="summary-total"]');
    expect(totalEl.textContent).toContain('9.160');
  });

  it('6. Debe rechazar cupones inválidos mostrando un mensaje de error en el DOM', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const couponInput = container.querySelector('[data-testid="coupon-input"]');
    const couponForm = container.querySelector('[data-testid="coupon-form"]');

    fireChange(couponInput, 'CUPON_FALSO_123');
    fireSubmit(couponForm);

    const feedback = container.querySelector('[data-testid="coupon-feedback"]');
    expect(feedback).not.toBeNull();
    expect(feedback.textContent).toContain('inválido');
  });

  it('7. Debe simular la finalización de compra, invocar onClearCart y mostrar alerta de confirmación', () => {
    render(
      <Cart 
        cartItems={mockItems} 
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemoveItem={mockOnRemoveItem}
        onClearCart={mockOnClearCart}
        onContinueShopping={mockOnContinueShopping}
      />
    );

    const btnCheckout = container.querySelector('[data-testid="btn-checkout"]');
    fireClick(btnCheckout);

    expect(mockOnClearCart).toHaveBeenCalledTimes(1);

    const successAlert = container.querySelector('[data-testid="checkout-success-alert"]');
    expect(successAlert).not.toBeNull();
    expect(successAlert.textContent).toContain('¡Compra simulada realizada con éxito!');
  });
});

