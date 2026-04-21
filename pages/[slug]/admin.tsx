import { useState, useEffect, useCallback } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  HStack,
  Badge,
  Spinner,
  IconButton,
  Tooltip,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { db } from '../../lib/firebase-admin';
import api from '../../product/api';
import { Product } from '../../product/types';

interface StoreData {
  id: string;
  username: string;
  storeName: string;
  sheetUrl: string;
  whatsappNumber: string;
  createdAt: string;
}

interface SyncStatus {
  status: 'loading' | 'success' | 'error' | 'checking';
  lastSync?: string;
  productCount?: number;
  error?: string;
}

const StoreAdmin: NextPage<{ storeData: StoreData }> = ({ storeData }) => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'loading' });
  const [products, setProducts] = useState<Product[]>([]);
  const [editingSheetUrl, setEditingSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar estado de sincronización
  const checkSyncStatus = useCallback(async () => {
    setSyncStatus({ status: 'checking' });
    try {
      if (!storeData.sheetUrl) {
        setSyncStatus({ 
          status: 'error', 
          error: 'No hay URL de Google Sheets configurada' 
        });
        return;
      }

      const fetchedProducts = await api.getProducts(storeData.sheetUrl);
      setProducts(fetchedProducts);
      
      setSyncStatus({
        status: 'success',
        lastSync: new Date().toLocaleString('es-PE'),
        productCount: fetchedProducts.length
      });
    } catch (error) {
      setSyncStatus({
        status: 'error',
        error: 'No se pudo conectar al Google Sheets'
      });
    }
  }, [storeData.sheetUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      checkSyncStatus();
    }
  }, [isAuthenticated, checkSyncStatus]);

  const handleLogin = () => {
    if (password === '123456') {
      setIsAuthenticated(true);
      setShowPasswordChange(true);
      toast({
        title: 'Bienvenido al panel de administración',
        description: 'Por tu seguridad, cambia la contraseña en tu primer ingreso.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Contraseña incorrecta',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast({
        title: 'La nueva contraseña no puede estar vacía',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/store/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: storeData.id, 
          newPassword 
        }),
      });

      if (res.ok) {
        setShowPasswordChange(false);
        setNewPassword('');
        toast({
          title: 'Contraseña actualizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Error al actualizar contraseña');
      }
    } catch (error) {
      toast({
        title: 'Error al actualizar contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSheetUrlUpdate = async () => {
    if (!editingSheetUrl) {
      toast({
        title: 'La URL no puede estar vacía',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/store/update-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: storeData.id, 
          sheetUrl: editingSheetUrl 
        }),
      });

      if (res.ok) {
        storeData.sheetUrl = editingSheetUrl;
        setEditingSheetUrl('');
        onOpen();
        checkSyncStatus();
        toast({
          title: 'URL de Google Sheets actualizada',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Error al actualizar URL');
      }
    } catch (error) {
      toast({
        title: 'Error al actualizar URL',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    router.push(`/${storeData.username}`);
  };

  const openStore = () => {
    window.open(`/${storeData.username}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin - {storeData.storeName}</title>
        </Head>
        <Box minHeight="100vh" backgroundColor="brand.bg" display="flex" alignItems="center" justifyContent="center">
          <Container maxWidth="container.sm">
            <Box backgroundColor="brand.card" border="1px solid" borderColor="brand.border" borderRadius="2xl" padding={8}>
              <Stack spacing={6} align="center">
                <Box fontSize="4xl">{'\ud83d\udd10'}</Box>
                <Box textAlign="center">
                  <Heading size="lg" color="brand.text" marginBottom={2}>
                    Panel de Administración
                  </Heading>
                  <Text color="brand.muted">
                    {storeData.storeName}
                  </Text>
                </Box>
                
                <FormControl>
                  <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                    Usuario
                  </FormLabel>
                  <Input
                    value={storeData.username}
                    isReadOnly
                    backgroundColor="rgba(255,255,255,0.05)"
                    borderColor="brand.border"
                    color="brand.muted"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                    Contraseña
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    backgroundColor="brand.bg"
                    borderColor="brand.border"
                    color="brand.text"
                    _placeholder={{ color: 'brand.muted' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </FormControl>

                <Button
                  onClick={handleLogin}
                  backgroundColor="primary.500"
                  color="white"
                  fontWeight="700"
                  borderRadius="lg"
                  width="full"
                  _hover={{ backgroundColor: 'primary.600' }}
                >
                  Ingresar
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin - {storeData.storeName}</title>
      </Head>

      <Box minHeight="100vh" backgroundColor="brand.bg">
        {/* Header */}
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
          <Container maxWidth="container.xl">
            <Flex alignItems="center" justifyContent="space-between">
              <HStack spacing={3}>
                <Box fontSize="xl">{'\ud83d\udcca'}</Box>
                <Box>
                  <Text fontWeight="800" fontSize="lg" color="brand.text" letterSpacing="-0.02em">
                    Admin - {storeData.storeName}
                  </Text>
                  <Text fontSize="xs" color="brand.muted">@{storeData.username}</Text>
                </Box>
              </HStack>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  color="brand.muted"
                  onClick={openStore}
                  _hover={{ color: 'brand.text', backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  Ver Tienda {'\u2197'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  color="brand.muted"
                  onClick={handleLogout}
                  _hover={{ color: 'brand.text', backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  Cerrar sesión
                </Button>
              </HStack>
            </Flex>
          </Container>
        </Box>

        <Container maxWidth="container.xl" paddingY={8} paddingX={6}>
          {/* Estado de Sincronización */}
          <Stack spacing={6}>
            <Box>
              <Heading size="md" color="brand.text" fontWeight="800" letterSpacing="-0.02em" marginBottom={4}>
                Estado de Sincronización
              </Heading>
              
              <Box
                backgroundColor="brand.card"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                padding={6}
              >
                <HStack spacing={4} marginBottom={4}>
                  <Box fontSize="2xl">
                    {syncStatus.status === 'loading' && <Spinner color="primary.500" />}
                    {syncStatus.status === 'checking' && <Spinner color="primary.500" />}
                    {syncStatus.status === 'success' && <Text>{'\u2705'}</Text>}
                    {syncStatus.status === 'error' && <Text>{'\u274c'}</Text>}
                  </Box>
                  <Box flex={1}>
                    <Text color="brand.text" fontWeight="600" fontSize="lg">
                      {syncStatus.status === 'loading' && 'Verificando conexión...'}
                      {syncStatus.status === 'checking' && 'Verificando conexión...'}
                      {syncStatus.status === 'success' && 'Conectado correctamente'}
                      {syncStatus.status === 'error' && 'Error de conexión'}
                    </Text>
                    {syncStatus.error && (
                      <Text color="red.400" fontSize="sm" marginTop={1}>
                        {syncStatus.error}
                      </Text>
                    )}
                    {syncStatus.lastSync && (
                      <Text color="brand.muted" fontSize="xs" marginTop={1}>
                        Última verificación: {syncStatus.lastSync}
                      </Text>
                    )}
                  </Box>
                </HStack>

                {syncStatus.status === 'success' && (
                  <Stack spacing={4}>
                    <Divider borderColor="brand.border" />
                    <HStack spacing={8}>
                      <Stat>
                        <StatLabel color="brand.muted" fontSize="sm">Productos</StatLabel>
                        <StatNumber color="brand.text" fontSize="2xl">{syncStatus.productCount}</StatNumber>
                        <StatHelpText color="brand.muted">Sincronizados</StatHelpText>
                      </Stat>
                    </HStack>
                  </Stack>
                )}

                <HStack spacing={3} marginTop={6}>
                  <Button
                    onClick={checkSyncStatus}
                    backgroundColor="primary.500"
                    color="white"
                    fontWeight="700"
                    borderRadius="lg"
                    _hover={{ backgroundColor: 'primary.600' }}
                  >
                    <HStack spacing={2}>
                      <Text>{'\ud83d\udd04'}</Text>
                      <Text>Verificar sincronización</Text>
                    </HStack>
                  </Button>
                </HStack>
              </Box>
            </Box>

            {/* Configuración de Google Sheets */}
            <Box>
              <Heading size="md" color="brand.text" fontWeight="800" letterSpacing="-0.02em" marginBottom={4}>
                Configuración de Google Sheets
              </Heading>
              
              <Box
                backgroundColor="brand.card"
                border="1px solid"
                borderColor="brand.border"
                borderRadius="xl"
                padding={6}
              >
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                      URL actual de Google Sheets
                    </FormLabel>
                    <Input
                      value={storeData.sheetUrl || 'No configurado'}
                      isReadOnly
                      backgroundColor="rgba(255,255,255,0.05)"
                      borderColor="brand.border"
                      color="brand.muted"
                      fontFamily="mono"
                      fontSize="sm"
                    />
                  </FormControl>

                  <Divider borderColor="brand.border" />

                  <FormControl>
                    <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                      Nueva URL de Google Sheets
                    </FormLabel>
                    <Input
                      value={editingSheetUrl}
                      onChange={(e) => setEditingSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      backgroundColor="brand.bg"
                      borderColor="brand.border"
                      color="brand.text"
                      _placeholder={{ color: 'brand.muted' }}
                      fontFamily="mono"
                      fontSize="sm"
                    />
                  </FormControl>

                  <Button
                    onClick={handleSheetUrlUpdate}
                    isLoading={loading}
                    backgroundColor="primary.500"
                    color="white"
                    fontWeight="700"
                    borderRadius="lg"
                    _hover={{ backgroundColor: 'primary.600' }}
                  >
                    Actualizar URL
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Modal para cambiar contraseña */}
      <Modal isOpen={showPasswordChange} onClose={() => {}} isCentered closeOnOverlayClick={false}>
        <ModalOverlay backdropFilter="blur(8px)" backgroundColor="rgba(15,23,42,0.8)" />
        <ModalContent backgroundColor="brand.card" border="1px solid" borderColor="brand.border" borderRadius="2xl">
          <ModalHeader color="brand.text" fontWeight="800" letterSpacing="-0.02em">
            {'\ud83d\udd10'} Cambiar Contraseña
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <Alert status="info" borderRadius="lg" fontSize="sm">
                <AlertIcon />
                Por tu seguridad, es recomendable cambiar la contraseña predeterminada.
              </Alert>
              
              <FormControl>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                  Nueva contraseña
                </FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  backgroundColor="brand.bg"
                  borderColor="brand.border"
                  color="brand.text"
                  _placeholder={{ color: 'brand.muted' }}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              onClick={handlePasswordChange}
              isLoading={loading}
              backgroundColor="primary.500"
              color="white"
              fontWeight="700"
              borderRadius="lg"
              _hover={{ backgroundColor: 'primary.600' }}
            >
              Cambiar contraseña
            </Button>
            <Button
              onClick={() => setShowPasswordChange(false)}
              variant="ghost"
              color="brand.muted"
              _hover={{ color: 'brand.text' }}
            >
              Omitir por ahora
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  try {
    const snapshot = await db
      .collection('clients')
      .where('username', '==', slug)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return { notFound: true };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const storeData = {
      id: doc.id,
      username: data.username,
      storeName: data.storeName,
      sheetUrl: data.sheetUrl,
      whatsappNumber: data.whatsappNumber,
      createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
    } as StoreData;

    return {
      props: { storeData }
    };
  } catch {
    return { notFound: true };
  }
};

export default StoreAdmin;
