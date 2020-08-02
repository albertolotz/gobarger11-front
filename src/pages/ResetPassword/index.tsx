import React, { useCallback, useRef } from 'react';
import { FiLogIn, FiLock } from 'react-icons/fi';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { FormHandles } from '@unform/core';
import { Link, useHistory, useLocation } from 'react-router-dom';
import getValidationsErrors from '../../utils/getValidationsErrors';
import logo from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useToast } from '../../hooks/Toast';

import { Container, Content, AninationContainer, Background } from './styles';
import api from '../../services/api';

interface ResetPasswordFormData {
  email: string;
  password: string;
  password_confirmation: string;
}

const ResetPassword: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();
  const history = useHistory();
  const location = useLocation();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          password: Yup.string().required('Senha obrigatória'),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Senha não combina',
          ),
        });
        await schema.validate(data, {
          abortEarly: false,
        });

        const { password, password_confirmation } = data;
        const token = location.search.replace('?token=', '');

        if (!token) {
          throw new Error();
        }

        await api.post('password/reset', {
          password,
          password_confirmation,
          token,
        });

        history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationsErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }

        addToast({
          type: 'error',
          title: 'Erro ao redefinir senha',
          description:
            'Ocorreu um erro ao redefinir sua senha, confira as credenciais.',
        });
      }
    },
    [addToast, history, location.search],
  );

  return (
    <Container>
      <Content>
        <AninationContainer>
          <img src={logo} alt="GoBarber" />
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Redefinir Senha</h1>

            <Input
              name="password"
              placeholder="nova senha"
              type="password"
              icon={FiLock}
            />
            <Input
              name="password_confirmation"
              placeholder="confirmação da senha"
              type="password"
              icon={FiLock}
            />

            <Button type="submit">Redefinir</Button>
          </Form>
          <Link to="/">
            <FiLogIn />
            Voltar para tela login
          </Link>
        </AninationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default ResetPassword;
