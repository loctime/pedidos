import { useState, useEffect, useMemo } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import {
  Button,
  Flex,
  Image,
  Grid,
  Link,
  Stack,
  Text,
  Box,
  Badge,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import api from '../product/api';
import { Product } from '../product/types';
import { usersCollection } from '../lib/firebase-admin';

interface Props {
  storeName: string;
  sheetUrl: string;
  whatsappNumber: string;
}

function parseCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(value);
}

const StorePage: NextPage<Props> = ({ storeName, sheetUrl, whatsappNumber }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!sheetUrl) {
      setFetchError('No hay catálogo configurado. Contacta al administrador.');
      setLoadingProducts(false);
      return;
    }
    api
      .getProducts(sheetUrl)
      .then(setProducts)
      .catch(() => setFetchError('No se pudo cargar el catálogo. Intenta de nuevo.'))
      .finally(() => setLoadingProducts(false));
  }, [sheetUrl]);

  const text = useMemo(
    () =>
      cart
        .reduce(
          (message, product) =>
            message.concat(`* ${product.title} - ${parseCurrency(product.price)}\n`),
          ``
        )
        .concat(
          `\nTotal: ${parseCurrency(cart.reduce((total, product) => total + product.price, 0))}`
        ),
    [cart]
  );

  const total = useMemo(() => cart.reduce((sum, p) => sum + p.price, 0), [cart]);

  return (
    <>
      <Head>
        <title>{storeName}</title>
        <meta name="description" content={`${storeName} — Pedidos al WhatsApp`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box minHeight="100vh" backgroundColor="brand.bg" paddingBottom={cart.length ? 28 : 8}>
        <Box
          as="header"
          borderBottom="1px solid"
          borderColor="brand.border"
          backgroundColor="brand.card"
          paddingY={4}
          paddingX={6}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Flex maxWidth="container.xl" mx="auto" alignItems="center" justifyContent="space-between">
            <Flex alignItems="center" gap={3}>
              <Box
                width={9}
                height={9}
                borderRadius="lg"
                background="linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="lg"
              >
                🛍️
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="lg" color="brand.text" lineHeight="1" letterSpacing="-0.02em">
                  {storeName}
                </Text>
                <Text fontSize="xs" color="brand.muted" fontWeight="500">
                  Pedidos al WhatsApp
                </Text>
              </Box>
            </Flex>
            <Badge
              borderRadius="full"
              paddingX={3}
              paddingY={1}
              fontSize="xs"
              fontWeight="700"
              textTransform="none"
              backgroundColor="rgba(34,197,94,0.15)"
              color="primary.400"
              border="1px solid rgba(34,197,94,0.3)"
            >
              ● Abierto
            </Badge>
          </Flex>
        </Box>

        <Box maxWidth="container.xl" mx="auto" paddingTop={8} paddingX={6}>
          <Box marginBottom={8}>
            <Text
              fontSize={{ base: '2xl', md: '3xl' }}
              fontWeight="800"
              color="brand.text"
              letterSpacing="-0.03em"
              lineHeight="1.1"
              marginBottom={1}
            >
              Nuestros Productos
            </Text>
            <Text color="brand.muted" fontSize="sm" fontWeight="500">
              {loadingProducts ? 'Cargando catálogo...' : `${products.length} productos disponibles`}
            </Text>
          </Box>

          {fetchError && (
            <Alert status="error" borderRadius="lg" marginBottom={6} fontSize="sm">
              <AlertIcon />{fetchError}
            </Alert>
          )}

          {loadingProducts ? (
            <Flex justifyContent="center" paddingY={20}>
              <Spinner color="primary.500" size="xl" thickness="3px" />
            </Flex>
          ) : (
            <Grid gridGap={5} templateColumns="repeat(auto-fill, minmax(240px, 1fr))">
              {products.map((product) => (
                <Box key={product.id}>
                  <Stack
                    backgroundColor="brand.card"
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid"
                    borderColor="brand.border"
                    spacing={0}
                    transition="all 0.2s ease"
                    _hover={{
                      borderColor: 'primary.500',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 0 0 1px rgba(34,197,94,0.4), 0 8px 24px rgba(0,0,0,0.4)',
                    }}
                    role="group"
                  >
                    <Box position="relative" overflow="hidden">
                      <Image
                        height="160px"
                        width="100%"
                        objectFit="cover"
                        src={product.image}
                        alt={product.title}
                        transition="transform 0.3s ease"
                        _groupHover={{ transform: 'scale(1.05)' }}
                        fallbackSrc="https://via.placeholder.com/400x200/1e293b/94a3b8?text=Sin+imagen"
                      />
                      {product.category && (
                        <Badge
                          position="absolute"
                          top={2}
                          left={2}
                          backgroundColor="rgba(15,23,42,0.85)"
                          color="primary.400"
                          borderRadius="full"
                          paddingX={2.5}
                          paddingY={0.5}
                          fontSize="2xs"
                          fontWeight="700"
                          textTransform="uppercase"
                          letterSpacing="0.08em"
                          backdropFilter="blur(8px)"
                          border="1px solid rgba(34,197,94,0.3)"
                        >
                          {product.category}
                        </Badge>
                      )}
                    </Box>

                    <Stack spacing={3} padding={4} flex={1}>
                      <Box flex={1}>
                        <Text color="brand.text" fontWeight="700" fontSize="sm" lineHeight="1.3" marginBottom={1}>
                          {product.title}
                        </Text>
                        {product.description && (
                          <Text color="brand.muted" fontSize="xs" lineHeight="1.5" noOfLines={2}>
                            {product.description}
                          </Text>
                        )}
                      </Box>
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text color="primary.400" fontWeight="800" fontSize="lg" letterSpacing="-0.02em">
                          {parseCurrency(product.price)}
                        </Text>
                      </HStack>
                      <Button
                        size="sm"
                        fontWeight="700"
                        borderRadius="lg"
                        backgroundColor="rgba(34,197,94,0.1)"
                        color="primary.400"
                        border="1px solid rgba(34,197,94,0.3)"
                        _hover={{ backgroundColor: 'primary.500', color: 'white', borderColor: 'primary.500' }}
                        _active={{ backgroundColor: 'primary.600', borderColor: 'primary.600' }}
                        transition="all 0.15s ease"
                        onClick={() => setCart((cart) => cart.concat(product))}
                      >
                        + Agregar al carrito
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {Boolean(cart.length) && (
          <Flex
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            justifyContent="center"
            padding={4}
            backgroundColor="rgba(15,23,42,0.9)"
            backdropFilter="blur(16px)"
            borderTop="1px solid"
            borderColor="brand.border"
            zIndex={100}
          >
            <Button
              as={Link}
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`}
              isExternal
              size="lg"
              fontWeight="800"
              borderRadius="xl"
              paddingX={8}
              backgroundColor="brand.whatsapp"
              color="white"
              fontSize="md"
              letterSpacing="-0.01em"
              _hover={{ backgroundColor: 'brand.whatsappHover', textDecoration: 'none', transform: 'scale(1.02)' }}
              _active={{ transform: 'scale(0.98)' }}
              transition="all 0.15s ease"
              boxShadow="0 4px 20px rgba(37,211,102,0.35)"
            >
              <HStack spacing={3}>
                <Text>💬</Text>
                <Box textAlign="left">
                  <Text fontSize="xs" fontWeight="600" opacity={0.85} lineHeight="1">
                    {cart.length} producto{cart.length !== 1 ? 's' : ''} · {parseCurrency(total)}
                  </Text>
                  <Text lineHeight="1.4">Completar pedido por WhatsApp</Text>
                </Box>
              </HStack>
            </Button>
          </Flex>
        )}
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const snapshot = await usersCollection()
      .where('username', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { notFound: true };
    }

    const client = snapshot.docs[0].data();

    return {
      props: {
        storeName: client.storeName,
        sheetUrl: client.sheetUrl,
        whatsappNumber: client.whatsappNumber || '510000000000',
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default StorePage;
