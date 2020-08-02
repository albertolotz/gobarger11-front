import React from 'react';
import { render, fireEvent, wait } from '@testing-library/react';
import SignIn from '../../pages/SignIn';

const mockedHistoryPush = jest.fn();
const mockedSignIn = jest.fn();

const mockedAddToast = jest.fn();

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../hooks/Auth', () => {
  return {
    useAuth: () => ({
      signIn: mockedSignIn,
    }),
  };
});

jest.mock('../../hooks/Toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast,
    }),
  };
});

describe('SignIn Page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
  });

  it('O Usuário deve se autenticar', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('email');
    const passwordField = getByPlaceholderText('senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, {
      target: { value: 'qualquer-email@gmail.com' },
    });

    fireEvent.change(passwordField, {
      target: { value: '123456' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('O Usuário não deve se autenticar com credenciais invalidas', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('email');
    const passwordField = getByPlaceholderText('senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, {
      target: { value: 'email-errado' },
    });

    fireEvent.change(passwordField, {
      target: { value: '123456' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedHistoryPush).not.toHaveBeenCalled();
    });
  });

  it('Aplicação deve mostrar erro em tela se ocorrer erro no login', async () => {
    mockedSignIn.mockImplementation(() => {
      throw new Error();
    });

    const { getByPlaceholderText, getByText } = render(<SignIn />);

    const emailField = getByPlaceholderText('email');
    const passwordField = getByPlaceholderText('senha');
    const buttonElement = getByText('Entrar');

    fireEvent.change(emailField, {
      target: { value: 'qualquer-email@gmail.com' },
    });

    fireEvent.change(passwordField, {
      target: { value: '123456' },
    });

    fireEvent.click(buttonElement);

    await wait(() => {
      expect(mockedAddToast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
        }),
      );
    });
  });
});
