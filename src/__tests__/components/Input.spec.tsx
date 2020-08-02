import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import Input from '../../components/Input';

jest.mock('@unform/core', () => {
  return {
    useField() {
      return {
        fieldName: 'email',
        defaultValue: '',
        error: '',
        registerField: jest.fn(),
      };
    },
  };
});

describe('Input component', () => {
  it('Input aparece na tela', () => {
    const { getAllByPlaceholderText } = render(
      <Input name="email" placeholder="E-mail" />,
    );

    expect(getAllByPlaceholderText('E-mail')).toBeTruthy();
  });

  it('Input fica com borda quando recebe focus', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <Input name="email" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholderText('E-mail');
    const containerElement = getByTestId('input-container');

    fireEvent.focus(inputElement);

    await wait(() => {
      expect(containerElement).toHaveStyle('border-color:#ff9000');
      expect(containerElement).toHaveStyle('color:#ff9000');
    });

    fireEvent.blur(inputElement);

    await wait(() => {
      expect(containerElement).not.toHaveStyle('border-color:#ff9000');
      expect(containerElement).not.toHaveStyle('color:#ff9000');
    });
  });

  it('Input aparece na tela', () => {
    const { getAllByPlaceholderText } = render(
      <Input name="email" placeholder="E-mail" />,
    );

    expect(getAllByPlaceholderText('E-mail')).toBeTruthy();
  });

  it('Input manter borda quando input contem algum valor', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <Input name="email" placeholder="E-mail" />,
    );

    const inputElement = getByPlaceholderText('E-mail');
    const containerElement = getByTestId('input-container');

    fireEvent.change(inputElement, {
      target: { value: 'um valor para o input' },
    });

    fireEvent.blur(inputElement);

    await wait(() => {
      expect(containerElement).toHaveStyle('color:#ff9000');
    });
  });
});
