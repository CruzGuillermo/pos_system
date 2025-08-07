import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useAuth } from "../contexts/AuthContext";
import FormularioCliente from "./FormularioCliente.jsx";
import BuscadorProductos from "./BuscadorProductos";
import TablaCarrito from "./TablaCarrito";
import PagoVenta from "./PagoVenta";
import HistorialVentas from "./HistorialVentas";
import GeneradorTicket from "./GeneradorTicket";

const MySwal = withReactContent(Swal);

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [lectorActivo, setLectorActivo] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [showHistorial, setShowHistorial] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [pagoValido, setPagoValido] = useState(true);
  const [ventaCreada, setVentaCreada] = useState(null);
  const [configuracionSistema, setConfiguracionSistema] = useState(null);


  const inputBusquedaRef = useRef(null);
  const { auth } = useAuth();
  const token = auth?.token;

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cliente: "",
      dni: "",
      metodoPago: "efectivo",
      tipoDescuento: "%",
      descuento: 0,
      pagoMixto_efectivo: "",
      pagoMixto_tarjeta: "",
      pagoMixto_transferencia: "",
      pagoMixto_qr: "",
    },
  });

  const metodoPago = watch("metodoPago");
  const tipoDescuento = watch("tipoDescuento");
  const descuento = watch("descuento");

  const totalBruto = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const totalFinal =
    tipoDescuento === "%" ? totalBruto - totalBruto * (descuento / 100) : totalBruto - descuento;

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    if (!token) return;
    setLoadingProductos(true);
    axios
      .get("http://localhost:3001/api/productos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error al cargar productos:", err))
      .finally(() => setLoadingProductos(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:3001/api/cajas/abierta", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCajaAbierta(res.data))
      .catch(() => setCajaAbierta(null));
  }, [token]);

  useEffect(() => {
  if (!token) return;
  axios
    .get("http://localhost:3001/api/configuracion/sistema", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setConfiguracionSistema(res.data))
    .catch((err) => {
      console.error("Error al obtener configuración del sistema:", err);
      setConfiguracionSistema(null);
    });
}, [token]);

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);

  const agregarProducto = (producto) => {
    const index = carrito.findIndex((p) => p.id === producto.id);
    if (index !== -1) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[index].cantidad += 1;
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    setBusqueda("");
    inputBusquedaRef.current?.focus();
  };

  const quitarProducto = (id) => setCarrito(carrito.filter((p) => p.id !== id));

  const cambiarCantidad = (id, cantidad) => {
    if (cantidad < 1) return;
    const nuevoCarrito = carrito.map((p) =>
      p.id === id ? { ...p, cantidad } : p
    );
    setCarrito(nuevoCarrito);
  };

  // Toast arriba a la derecha
  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

const onSubmitVenta = async (data) => {
  if (carrito.length === 0) {
    return Swal.fire({
      icon: "warning",
      title: "Carrito vacío",
      text: "Debe agregar al menos un producto",
    });
  }

  if (!cajaAbierta && !configuracionSistema?.permitir_venta_sin_caja) {
    return Swal.fire({
      icon: "error",
      title: "Sin caja abierta",
      text: "No hay una caja abierta para registrar la venta y el sistema no permite vender sin caja.",
    });
  }

  if (!pagoValido) {
    return Swal.fire({
      icon: "warning",
      title: "Pago inválido",
      text: "Los valores del pago mixto no son válidos",
    });
  }

  const detalles = carrito.map((p) => ({
    producto_id: p.id,
    cantidad: p.cantidad,
    precio_unitario: p.precio,
  }));

  let pagos = [];

  if (data.metodoPago === "mixto") {
    pagos = [
      { tipo_pago: "efectivo", monto: Number(data.pagoMixto_efectivo || "") },
      { tipo_pago: "tarjeta", monto: Number(data.pagoMixto_tarjeta || "") },
      { tipo_pago: "transferencia", monto: Number(data.pagoMixto_transferencia || "") },
      { tipo_pago: "qr", monto: Number(data.pagoMixto_qr || "") },
    ].filter((p) => p.monto > 0);
  } else {
    pagos = [{ tipo_pago: data.metodoPago, monto: totalFinal }];
  }

  const venta = {
    codigo: `V-${Date.now()}`,
    total: totalFinal,
    cliente_id: null,
    cliente_nombre: data.cliente.trim(),
    cliente_dni: data.dni.trim(),
    cliente_domicilio: "",
    caja_id: cajaAbierta ? cajaAbierta.id : null,
    detalles,
    pagos,
  };

  try {
    const response = await axios.post("http://localhost:3001/api/ventas", venta, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = response.data;

    const ventaCompleta = {
      ...data.venta,
      configuracion_sucursal: data.configuracion_sucursal,
      configuracion_impresion: data.configuracion_impresion,
    };

    setVentaCreada(ventaCompleta);
    setCarrito([]);
    setValue("descuento", 0);
    setValue("tipoDescuento", "%");
    reset();

    showToast("success", "Venta registrada con éxito");
  } catch (error) {
    console.error("Error al registrar venta:", error);

    // Manejo específico según error del backend
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message;

    switch (status) {
      case 400:
        Swal.fire({
          icon: "error",
          title: "Error en la venta",
          text: message || "Datos inválidos para registrar la venta.",
        });
        break;
      case 404:
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Recurso no encontrado.",
        });
        break;
      case 500:
        Swal.fire({
          icon: "error",
          title: "Error del servidor",
          text: "Ocurrió un error interno al procesar la venta.",
        });
        break;
      default:
        Swal.fire({
          icon: "error",
          title: "Error inesperado",
          text: message || "Ocurrió un error al registrar la venta.",
        });
    }
  }
};


  return (
    <Container className="mt-3">
      <Row className="mb-3">
        <Col>
          <h2>Nueva Venta</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => setShowHistorial(true)}>
            Historial de Ventas
          </Button>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit(onSubmitVenta)}>
        <FormularioCliente register={register} errors={errors} />

        <BuscadorProductos
          busqueda={busqueda}
          productosFiltrados={productosFiltrados}
          loadingProductos={loadingProductos}
          handleBusquedaChange={handleBusquedaChange}
          agregarProducto={agregarProducto}
          lectorActivo={lectorActivo}
          setLectorActivo={setLectorActivo}
          inputBusquedaRef={inputBusquedaRef}
        />

        <TablaCarrito
          carrito={carrito}
          quitarProducto={quitarProducto}
          cambiarCantidad={cambiarCantidad}
          totalBruto={totalBruto}
          register={register}
          errors={errors}
          tipoDescuento={tipoDescuento}
          totalFinal={totalFinal}
        />

        <PagoVenta
          metodoPago={metodoPago}
          register={register}
          control={control}
          setValue={setValue}
          errors={errors}
          totalFinal={totalFinal}
          setPagoValido={setPagoValido}
          ventaCreada={ventaCreada}
        />

        <Row className="mt-3">
          <Col md={6}>
            <Button variant="success" type="submit" className="w-100">
              {metodoPago === "mixto" ? "Finalizar Venta Mixta" : "Finalizar Venta"}
            </Button>
          </Col>
        </Row>
      </Form>

      {ventaCreada && <GeneradorTicket venta={ventaCreada} />}

      <HistorialVentas show={showHistorial} onClose={() => setShowHistorial(false)} />
    </Container>
  );
}
