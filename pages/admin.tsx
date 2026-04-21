import { useState, useEffect, useCallback } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
  Badge,
  IconButton,
  Alert,
  AlertIcon,
  HStack,
  Tooltip,
  TableContainer,
} from '@chakra-ui/react';
import { sessionOptions } from '../lib/session';
import { usersCollection } from '../lib/firebase-admin';

interface Client {
  id: string;
  username: string;
  storeName: string;
  sheetUrl: string;
  whatsappNumber: string;
  driveEmail?: string;
  createdAt: string;
}

const emptyForm = {
  username: '',
  password: '',
  storeName: '',
  sheetUrl: '',
  whatsappNumber: '',
  driveEmail: '',
};

const Admin: NextPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = useCallback(async () => {
    const res = await fetch('/api/admin/clients');
    if (res.ok) setClients(await res.json());
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const copyUrl = (username: string) => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'URL copiada',
        description: url,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
    });
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    onOpen();
  };

  const openEdit = (client: Client) => {
    setForm({
      username: client.username,
      password: '',
      storeName: client.storeName,
      sheetUrl: client.sheetUrl,
      whatsappNumber: client.whatsappNumber,
      driveEmail: client.driveEmail || '',
    });
    setEditId(client.id);
    setError('');
    onOpen();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = editId ? { id: editId, ...form } : form;
      const res = await fetch('/api/admin/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error'); return; }
      toast({
        title: editId ? 'Cliente actualizado' : 'Cliente creado',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom-right',
      });
      onClose();
      fetchClients();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, storeName: string) => {
    if (!confirm(`¿Eliminar la tienda "${storeName}"?`)) return;
    await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
    fetchClients();
  };

  const inputStyle = {
    backgroundColor: 'brand.bg',
    border: '1px solid',
    borderColor: 'brand.border',
    color: 'brand.text',
    _placeholder: { color: 'brand.muted' },
    _focus: { borderColor: 'primary.500', boxShadow: '0 0 0 1px rgba(34,197,94,0.4)' },
    _hover: { borderColor: 'brand.muted' },
  };

  return (
    <>
      <Head><title>Panel de administración</title></Head>
      <Box minHeight="100vh" backgroundColor="brand.bg">
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
                <Box fontSize="xl">⚙️</Box>
                <Box>
                  <Text fontWeight="800" fontSize="lg" color="brand.text" letterSpacing="-0.02em">
                    Panel de administración
                  </Text>
                  <Text fontSize="xs" color="brand.muted">Gestión de clientes</Text>
                </Box>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                color="brand.muted"
                onClick={handleLogout}
                _hover={{ color: 'brand.text', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                Cerrar sesión
              </Button>
            </Flex>
          </Container>
        </Box>

        <Container maxWidth="container.xl" paddingY={8} paddingX={6}>
          <Flex justifyContent="space-between" alignItems="center" marginBottom={6}>
            <Box>
              <Heading size="md" color="brand.text" fontWeight="800" letterSpacing="-0.02em">
                Tiendas
              </Heading>
              <Text color="brand.muted" fontSize="sm">{clients.length} tiendas registradas</Text>
            </Box>
            <Button
              onClick={openCreate}
              backgroundColor="primary.500"
              color="white"
              fontWeight="700"
              borderRadius="lg"
              _hover={{ backgroundColor: 'primary.600' }}
            >
              + Nueva tienda
            </Button>
          </Flex>

          <Box
            backgroundColor="brand.card"
            border="1px solid"
            borderColor="brand.border"
            borderRadius="xl"
            overflow="hidden"
          >
            <TableContainer>
              <Table variant="unstyled" size="sm">
                <Thead>
                  <Tr borderBottom="1px solid" borderColor="brand.border">
                    <Th color="brand.muted" fontWeight="700" fontSize="xs" paddingY={3}>TIENDA</Th>
                    <Th color="brand.muted" fontWeight="700" fontSize="xs" paddingY={3}>URL PÚBLICA</Th>
                    <Th color="brand.muted" fontWeight="700" fontSize="xs" paddingY={3}>WHATSAPP</Th>
                    <Th color="brand.muted" fontWeight="700" fontSize="xs" paddingY={3}>EMAIL DRIVE</Th>
                    <Th color="brand.muted" fontWeight="700" fontSize="xs" paddingY={3}>GOOGLE SHEET</Th>
                    <Th paddingY={3}></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clients.length === 0 && (
                    <Tr>
                      <Td colSpan={6} textAlign="center" paddingY={12} color="brand.muted">
                        No hay tiendas aún. ¡Crea la primera!
                      </Td>
                    </Tr>
                  )}
                  {clients.map((client) => (
                    <Tr
                      key={client.id}
                      borderBottom="1px solid"
                      borderColor="brand.border"
                      _last={{ borderBottom: 'none' }}
                      _hover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                    >
                      <Td paddingY={4}>
                        <Box>
                          <Text color="brand.text" fontWeight="700" fontSize="sm">
                            {client.storeName}
                          </Text>
                          <Badge
                            mt={1}
                            backgroundColor="rgba(34,197,94,0.1)"
                            color="primary.400"
                            borderRadius="full"
                            paddingX={2}
                            paddingY={0.5}
                            fontSize="2xs"
                            fontWeight="700"
                            border="1px solid rgba(34,197,94,0.2)"
                          >
                            @{client.username}
                          </Badge>
                        </Box>
                      </Td>
                      <Td paddingY={4}>
                        <HStack spacing={2}>
                          <Text color="brand.muted" fontSize="xs" fontFamily="mono">
                            /{client.username}
                          </Text>
                          <Tooltip label="Copiar URL" placement="top">
                            <IconButton
                              aria-label="Copiar URL"
                              icon={<>📋</>}
                              size="xs"
                              variant="ghost"
                              onClick={() => copyUrl(client.username)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                      <Td color="brand.muted" fontSize="sm" paddingY={4}>
                        +{client.whatsappNumber}
                      </Td>
                      <Td paddingY={4}>
                        {client.driveEmail ? (
                          <HStack spacing={2}>
                            <Text>{'✉️'}</Text>
                            <Text color="brand.muted" fontSize="xs" fontFamily="mono">
                              {client.driveEmail}
                            </Text>
                          </HStack>
                        ) : (
                          <Text color="brand.muted" fontSize="xs" fontStyle="italic">
                            No registrado
                          </Text>
                        )}
                      </Td>
                      <Td paddingY={4}>
                        <Tooltip label={client.sheetUrl} placement="top">
                          <Text
                            color="brand.muted"
                            fontSize="xs"
                            maxWidth="180px"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {client.sheetUrl}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td paddingY={4}>
                        <HStack spacing={1} justifyContent="flex-end">
                          <Tooltip label="Editar" placement="top">
                            <IconButton
                              aria-label="Editar"
                              icon={<>✏️</>}
                              size="xs"
                              variant="ghost"
                              onClick={() => openEdit(client)}
                            />
                          </Tooltip>
                          <Tooltip label="Eliminar" placement="top">
                            <IconButton
                              aria-label="Eliminar"
                              icon={<>🗑️</>}
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDelete(client.id, client.storeName)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay backdropFilter="blur(8px)" backgroundColor="rgba(15,23,42,0.8)" />
        <ModalContent backgroundColor="brand.card" border="1px solid" borderColor="brand.border" borderRadius="2xl">
          <ModalHeader color="brand.text" fontWeight="800" letterSpacing="-0.02em">
            {editId ? 'Editar tienda' : 'Nueva tienda'}
          </ModalHeader>
          <ModalCloseButton color="brand.muted" />
          <ModalBody>
            <Stack spacing={4}>
              {error && (
                <Alert status="error" borderRadius="lg" fontSize="sm">
                  <AlertIcon />{error}
                </Alert>
              )}
              <FormControl isRequired={!editId}>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                  Usuario (slug de URL)
                </FormLabel>
                <Input
                  {...inputStyle}
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  placeholder="mi-tienda"
                  isReadOnly={!!editId}
                  opacity={editId ? 0.6 : 1}
                />
                {!editId && (
                  <Text color="brand.muted" fontSize="xs" mt={1}>
                    La tienda será accesible en: <strong>tudominio.com/{form.username || 'slug'}</strong>
                  </Text>
                )}
              </FormControl>
              <FormControl isRequired={!editId}>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">
                  {editId ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </FormLabel>
                <Input
                  {...inputStyle}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">Nombre de la tienda</FormLabel>
                <Input
                  {...inputStyle}
                  value={form.storeName}
                  onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  placeholder="La Tiendita de María"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">URL de Google Sheets (CSV publicado)</FormLabel>
                <Input
                  {...inputStyle}
                  value={form.sheetUrl}
                  onChange={(e) => setForm((f) => ({ ...f, sheetUrl: e.target.value }))}
                  placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">Número WhatsApp</FormLabel>
                <Input
                  {...inputStyle}
                  value={form.whatsappNumber}
                  onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="510000000000"
                />
              </FormControl>
              <FormControl>
                <FormLabel color="brand.muted" fontSize="sm" fontWeight="600">Email de Google Drive (Opcional)</FormLabel>
                <Input
                  {...inputStyle}
                  value={form.driveEmail}
                  onChange={(e) => setForm((f) => ({ ...f, driveEmail: e.target.value }))}
                  placeholder="cliente@gmail.com"
                  type="email"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose} color="brand.muted" _hover={{ color: 'brand.text' }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              backgroundColor="primary.500"
              color="white"
              fontWeight="700"
              borderRadius="lg"
              _hover={{ backgroundColor: 'primary.600' }}
            >
              {editId ? 'Guardar cambios' : 'Crear tienda'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.isLoggedIn || !session.isAdmin) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
};

export default Admin;
