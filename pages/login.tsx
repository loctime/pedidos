import { useState } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { sessionOptions } from '../lib/session';

const Login: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      router.push('/admin');
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar sesión</title>
      </Head>
      <Box
        minHeight="100vh"
        backgroundColor="brand.bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        padding={4}
      >
        <Container maxWidth="sm">
          <Box
            backgroundColor="brand.card"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="2xl"
            padding={8}
          >
            <Stack spacing={6}>
              <Stack spacing={1} textAlign="center">
                <Box fontSize="3xl">⚙️</Box>
                <Heading
                  size="lg"
                  color="brand.text"
                  fontWeight="800"
                  letterSpacing="-0.03em"
                >
                  Administración
                </Heading>
                <Text color="brand.muted" fontSize="sm">
                  Acceso exclusivo para administradores
                </Text>
              </Stack>

              {error && (
                <Alert status="error" borderRadius="lg" fontSize="sm">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                      Usuario
                    </FormLabel>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="tu-usuario"
                      backgroundColor="brand.bg"
                      border="1px solid"
                      borderColor="brand.border"
                      color="brand.text"
                      _placeholder={{ color: 'brand.muted' }}
                      _focus={{
                        borderColor: 'primary.500',
                        boxShadow: '0 0 0 1px rgba(34,197,94,0.4)',
                      }}
                      _hover={{ borderColor: 'brand.muted' }}
                      required
                      autoComplete="username"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                      Contraseña
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        backgroundColor="brand.bg"
                        border="1px solid"
                        borderColor="brand.border"
                        color="brand.text"
                        _placeholder={{ color: 'brand.muted' }}
                        _focus={{
                          borderColor: 'primary.500',
                          boxShadow: '0 0 0 1px rgba(34,197,94,0.4)',
                        }}
                        _hover={{ borderColor: 'brand.muted' }}
                        required
                        autoComplete="current-password"
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                          icon={<>{showPassword ? '🙈' : '👁️'}</>}
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword((v) => !v)}
                          color="brand.muted"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    isLoading={loading}
                    loadingText="Ingresando..."
                    backgroundColor="primary.500"
                    color="white"
                    fontWeight="700"
                    borderRadius="lg"
                    size="lg"
                    _hover={{ backgroundColor: 'primary.600' }}
                    _active={{ backgroundColor: 'primary.700' }}
                    mt={2}
                  >
                    Iniciar sesión
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession(req, res, sessionOptions);
  if (session.isLoggedIn) {
    return { redirect: { destination: '/admin', permanent: false } };
  }
  return { props: {} };
};

export default Login;
