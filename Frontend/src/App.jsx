import { useEffect, useState } from 'react';
import API from './api';

function App() {
  const [pestana, setPestana] = useState('ventas');

  // Estados de Inventario
  const [productos, setProductos] = useState([]);
  const [nombreProd, setNombreProd] = useState('');
  const [presentacionProd, setPresentacionProd] = useState('');
  const [loteProd, setLoteProd] = useState('');
  const [costoUnitarioProd, setCostoUnitarioProd] = useState('');
  const [precioProd, setPrecioProd] = useState('');
  const [stockProd, setStockProd] = useState('');
  const [fechaVenc, setFechaVenc] = useState('');

  // Estado para Edición de Productos
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCosto, setEditCosto] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editStock, setEditStock] = useState('');

  // Estados de Caja y Balance
  const [caja, setCaja] = useState({ estado: 'cerrada', monto_inicial: 0, monto_final: 0 });
  const [montoApertura, setMontoApertura] = useState('');
  const [efectivoContado, setEfectivoContado] = useState('');
  const [balanceGeneral, setBalanceGeneral] = useState(null);
  const [historialCajas, setHistorialCajas] = useState([]);

  // Estados de Gastos Operativos
  const [gastos, setGastos] = useState([]);
  const [conceptoGasto, setConceptoGasto] = useState('');
  const [categoriaGasto, setCategoriaGasto] = useState('Fijo');
  const [montoGasto, setMontoGasto] = useState('');
  const [observacionGasto, setObservacionGasto] = useState('');

  // Estados de Ventas / POS
  const [carrito, setCarrito] = useState([]);
  const [busquedaVenta, setBusquedaVenta] = useState('');
  const [cantVenta, setCantVenta] = useState(1);
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [nombreClienteVenta, setNombreClienteVenta] = useState('');
  const [telefonoClienteVenta, setTelefonoClienteVenta] = useState('');
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarCaja();
    cargarVentas();
    cargarBalanceGeneral();
    cargarHistorialCajas();
    cargarGastos();
  }, []);

  const cargarProductos = () => {
    API.get('/productos/')
      .then((res) => setProductos(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Error al cargar productos:', err));
  };

  const cargarCaja = () => {
    API.get('/caja/estado/')
      .then((res) => {
        if (res.data) {
          setCaja(res.data);
        }
      })
      .catch((err) => console.error('Error al cargar caja:', err));
  };

  const cargarVentas = () => {
    API.get('/ventas/')
      .then((res) => setVentas(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Error al cargar ventas:', err));
  };

  const cargarBalanceGeneral = () => {
    API.get('/balance/general/')
      .then((res) => setBalanceGeneral(res.data))
      .catch((err) => console.error('Error al cargar balance general:', err));
  };

  const cargarHistorialCajas = () => {
    API.get('/caja/historial/')
      .then((res) => setHistorialCajas(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Error al cargar historial de cajas:', err));
  };

  const cargarGastos = () => {
    API.get('/gastos/')
      .then((res) => setGastos(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Error al cargar gastos:', err));
  };

  // --- ACCIONES INVENTARIO ---
  const guardarProducto = (e) => {
    e.preventDefault();
    if (!nombreProd || !precioProd || !stockProd) return alert('Llene nombre, precio venta y stock');

    const stockNum = parseInt(stockProd, 10);
    const costoUnitarioNum = costoUnitarioProd ? parseFloat(costoUnitarioProd.toString().replace(',', '.')) : 0;
    const nombreCompleto = presentacionProd ? `${nombreProd} (${presentacionProd})` : nombreProd;

    const payload = {
      nombre: nombreCompleto,
      codigo_barras: "ID-" + Date.now(),
      precio: parseFloat(precioProd.toString().replace(',', '.')),
      costo: parseFloat(costoUnitarioNum.toFixed(2)),
      stock: stockNum,
      fecha_vencimiento: fechaVenc ? fechaVenc : null
    };

    API.post('/productos/', payload)
      .then(() => {
        setNombreProd(''); 
        setPresentacionProd('');
        setLoteProd('');
        setCostoUnitarioProd('');
        setPrecioProd(''); 
        setStockProd(''); 
        setFechaVenc('');
        cargarProductos();
      })
      .catch((err) => {
        alert('Error al guardar producto: ' + (err.response?.data?.detail || err.message));
      });
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setEditNombre(p.nombre);
    setEditCosto(p.costo || 0);
    setEditPrecio(p.precio);
    setEditStock(p.stock);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  const guardarEdicion = (id) => {
    const payload = {
      nombre: editNombre,
      costo: parseFloat(editCosto.toString().replace(',', '.')),
      precio: parseFloat(editPrecio.toString().replace(',', '.')),
      stock: parseInt(editStock, 10)
    };

    API.put(`/productos/${id}`, payload)
      .then(() => {
        setEditandoId(null);
        cargarProductos();
      })
      .catch((err) => alert('Error al actualizar producto: ' + (err.response?.data?.detail || err.message)));
  };

  const eliminarProducto = (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto del inventario?')) {
      API.delete(`/productos/${id}`)
        .then(() => cargarProductos())
        .catch((err) => alert('Error al eliminar producto: ' + err.message));
    }
  };

  // --- ACCIONES CAJA Y BALANCE ---
  const abrirCaja = (e) => {
    e.preventDefault();
    if (!montoApertura) return alert('Ingrese monto inicial');
    API.post('/caja/abrir/', { monto_inicial: parseFloat(montoApertura.toString().replace(',', '.')) })
      .then(() => { 
        setMontoApertura(''); 
        cargarCaja(); 
        cargarBalanceGeneral();
      })
      .catch((err) => alert(err.response?.data?.detail || 'Error al abrir caja'));
  };

  const cerrarCaja = (e) => {
    e.preventDefault();
    if (efectivoContado === '') return alert('Ingrese el efectivo contado en caja');
    
    API.post('/caja/cerrar/', { efectivo_contado: parseFloat(efectivoContado.toString().replace(',', '.')) })
      .then(() => {
        alert('¡Caja cerrada y balance guardado con éxito!');
        setEfectivoContado('');
        cargarCaja();
        cargarBalanceGeneral();
        cargarHistorialCajas();
      })
      .catch((err) => alert(err.response?.data?.detail || 'Error al cerrar caja'));
  };

  // --- ACCIONES GASTOS OPERATIVOS ---
  const registrarGasto = (e) => {
    e.preventDefault();
    if (!conceptoGasto || !montoGasto) return alert('Ingrese concepto y monto del gasto');

    const payload = {
      concepto: conceptoGasto,
      categoria: categoriaGasto,
      monto: parseFloat(montoGasto.toString().replace(',', '.')),
      observacion: observacionGasto ? observacionGasto : null
    };

    API.post('/gastos/', payload)
      .then(() => {
        setConceptoGasto('');
        setMontoGasto('');
        setObservacionGasto('');
        cargarGastos();
        cargarBalanceGeneral();
      })
      .catch((err) => alert('Error al registrar gasto: ' + (err.response?.data?.detail || err.message)));
  };

  const eliminarGasto = (id) => {
    if (window.confirm('¿Desea eliminar este gasto operativo?')) {
      API.delete(`/gastos/${id}`)
        .then(() => {
          cargarGastos();
          cargarBalanceGeneral();
        })
        .catch((err) => alert('Error al eliminar gasto: ' + err.message));
    }
  };

  // --- ACCIONES VENTAS / POS ---
  const agregarProductoDirecto = (prod) => {
    if (prod.stock <= 0) {
      return alert(`El producto '${prod.nombre}' no tiene stock disponible.`);
    }

    const cantidadNum = parseInt(cantVenta, 10) || 1;
    if (cantidadNum > prod.stock) {
      return alert(`Stock insuficiente. Solo quedan ${prod.stock} unidades.`);
    }

    const existeEnCarrito = carrito.find((item) => item.producto_id === prod.id);
    if (existeEnCarrito) {
      if (existeEnCarrito.cantidad + cantidadNum > prod.stock) {
        return alert(`No puede superar el stock disponible (${prod.stock})`);
      }
      setCarrito(
        carrito.map((item) =>
          item.producto_id === prod.id
            ? { ...item, cantidad: item.cantidad + cantidadNum, subtotal: (item.cantidad + cantidadNum) * item.precio }
            : item
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          producto_id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          cantidad: cantidadNum,
          subtotal: prod.precio * cantidadNum
        }
      ]);
    }

    setBusquedaVenta('');
    setCantVenta(1);
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito(carrito.filter((item) => item.producto_id !== productoId));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  const recibidoNum = parseFloat(efectivoRecibido) || 0;
  const vueltas = recibidoNum > totalCarrito ? recibidoNum - totalCarrito : 0;

  const finalizarVenta = () => {
    if (carrito.length === 0) return alert('El carrito está vacío');

    if (tipoPago === 'efectivo' && recibidoNum < totalCarrito) {
      return alert('El dinero recibido del cliente es menor que el total de la venta.');
    }

    const payload = {
      items: carrito.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      tipo_pago: tipoPago,
      nombre_cliente: nombreClienteVenta ? nombreClienteVenta.trim() : null,
      telefono_cliente: telefonoClienteVenta ? telefonoClienteVenta.trim() : null
    };

    API.post('/ventas/', payload)
      .then((res) => {
        alert(`¡Venta realizada con éxito! Total: $${res.data.total_venta || res.data.total}`);
        setCarrito([]);
        setNombreClienteVenta('');
        setTelefonoClienteVenta('');
        setEfectivoRecibido('');
        cargarProductos();
        cargarCaja();
        cargarVentas();
        cargarBalanceGeneral();
      })
      .catch((err) => {
        alert('Error al registrar la venta: ' + (err.response?.data?.detail || err.message));
      });
  };

  const eliminarVenta = (id) => {
    if (window.confirm(`¿Seguro que deseas eliminar el registro de la venta #${id}?`)) {
      API.delete(`/ventas/${id}`)
        .then(() => {
          cargarVentas();
          cargarCaja();
          cargarBalanceGeneral();
        })
        .catch((err) => alert('Error al eliminar venta: ' + err.message));
    }
  };

  const productosFiltrados = busquedaVenta.trim() === '' ? [] : productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaVenta.toLowerCase())
  );

  const hoyStr = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.fecha && v.fecha.startsWith(hoyStr));
  const totalVendidoHoy = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0);

  const stockTemp = parseInt(stockProd, 10) || 0;
  const costoUnitarioTemp = parseFloat(costoUnitarioProd) || 0;
  const costoTotalCalculado = (stockTemp * costoUnitarioTemp).toLocaleString('es-CO', { maximumFractionDigits: 2 });

  return (
    <div style={{ maxWidth: '1050px', margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: '0 15px' }}>
      <h1 style={{ textAlign: 'center', color: '#1a365d' }}>DroguIA - Control Total</h1>

      {/* Menú de Navegación */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPestana('ventas')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderRadius: '5px', border: 'none', backgroundColor: pestana === 'ventas' ? '#2b6cb0' : '#e2e8f0', color: pestana === 'ventas' ? 'white' : 'black', cursor: 'pointer' }}
        >
          🛒 POS e Historial
        </button>
        <button
          onClick={() => setPestana('inventario')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderRadius: '5px', border: 'none', backgroundColor: pestana === 'inventario' ? '#2b6cb0' : '#e2e8f0', color: pestana === 'inventario' ? 'white' : 'black', cursor: 'pointer' }}
        >
          📦 Inventario
        </button>
        <button
          onClick={() => setPestana('caja')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderRadius: '5px', border: 'none', backgroundColor: pestana === 'caja' ? '#2b6cb0' : '#e2e8f0', color: pestana === 'caja' ? 'white' : 'black', cursor: 'pointer' }}
        >
          💰 Caja y Balance
        </button>
        <button
          onClick={() => setPestana('historico')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderRadius: '5px', border: 'none', backgroundColor: pestana === 'historico' ? '#2b6cb0' : '#e2e8f0', color: pestana === 'historico' ? 'white' : 'black', cursor: 'pointer' }}
        >
          📈 Balance Histórico
        </button>
        <button
          onClick={() => setPestana('gastos')}
          style={{ padding: '10px 15px', fontWeight: 'bold', borderRadius: '5px', border: 'none', backgroundColor: pestana === 'gastos' ? '#2b6cb0' : '#e2e8f0', color: pestana === 'gastos' ? 'white' : 'black', cursor: 'pointer' }}
        >
          🏷️ Gastos Operativos
        </button>
      </div>

      {/* PESTAÑA: VENTAS / POS */}
      {pestana === 'ventas' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0', position: 'relative' }}>
              <h3>Búsqueda Rápida de Productos</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label>Escribe el nombre del medicamento:</label>
                <input
                  type="text"
                  placeholder="Ej. Acetaminofén, Pax Noche..."
                  value={busquedaVenta}
                  onChange={(e) => setBusquedaVenta(e.target.value)}
                  style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '15px' }}
                />

                <label>Cantidad a llevar:</label>
                <input
                  type="number"
                  min="1"
                  value={cantVenta}
                  onChange={(e) => setCantVenta(e.target.value)}
                  style={{ padding: '8px', borderRadius: '4px', width: '100px' }}
                />

                {busquedaVenta.trim() !== '' && (
                  <div style={{ background: 'white', border: '1px solid #cbd5e0', borderRadius: '6px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {productosFiltrados.length === 0 ? (
                      <p style={{ padding: '10px', color: 'gray', margin: 0, textAlign: 'center' }}>No se encontró ningún producto</p>
                    ) : (
                      productosFiltrados.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => agregarProductoDirecto(p)}
                          style={{ padding: '10px 12px', borderBottom: '1px solid #edf2f7', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: p.stock <= 0 ? '#fff5f5' : 'white' }}
                        >
                          <div>
                            <strong>{p.nombre}</strong>
                            <div style={{ fontSize: '13px', color: '#4a5568' }}>Precio: ${p.precio} | Stock: {p.stock}</div>
                          </div>
                          <button
                            disabled={p.stock <= 0}
                            style={{ backgroundColor: p.stock <= 0 ? '#cbd5e0' : '#319795', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: p.stock <= 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                          >
                            {p.stock <= 0 ? 'Agotado' : '➕ Agregar'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
              <h3>Detalle de Venta</h3>
              {carrito.length === 0 ? (
                <p style={{ color: 'gray' }}>El carrito está vacío. Usa la búsqueda rápida para agregar productos.</p>
              ) : (
                <div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e0' }}>
                        <th style={{ textAlign: 'left' }}>Producto</th>
                        <th style={{ textAlign: 'center' }}>Cant</th>
                        <th style={{ textAlign: 'right' }}>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item) => (
                        <tr key={item.producto_id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td>{item.nombre}</td>
                          <td style={{ textAlign: 'center' }}>{item.cantidad}</td>
                          <td style={{ textAlign: 'right' }}>${item.subtotal}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button onClick={() => quitarDelCarrito(item.producto_id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>❌</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <h2 style={{ textAlign: 'right', color: '#2b6cb0' }}>Total: ${totalCarrito}</h2>

                  <div style={{ marginTop: '15px', borderTop: '1px solid #cbd5e0', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    <label style={{ fontWeight: 'bold' }}>Datos del Cliente (Opcional para WhatsApp):</label>
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={nombreClienteVenta}
                      onChange={(e) => setNombreClienteVenta(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    />
                    <input
                      type="text"
                      placeholder="Teléfono / WhatsApp"
                      value={telefonoClienteVenta}
                      onChange={(e) => setTelefonoClienteVenta(e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                    />

                    <label style={{ fontWeight: 'bold', marginTop: '5px' }}>Medio de Pago:</label>
                    <select
                      value={tipoPago}
                      onChange={(e) => setTipoPago(e.target.value)}
                      style={{ padding: '8px', width: '100%', marginBottom: '5px' }}
                    >
                      <option value="efectivo">💵 Efectivo</option>
                      <option value="nequi">📱 Nequi</option>
                      <option value="daviplata">📱 Daviplata</option>
                      <option value="tarjeta">💳 Tarjeta (Débito / Crédito)</option>
                      <option value="breve">📱 Breve</option>
                    </select>

                    {tipoPago === 'efectivo' && (
                      <div style={{ background: '#edf2f7', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#2d3748' }}>💵 ¿Con cuánto paga el cliente?</label>
                        <input
                          type="number"
                          placeholder="Ej. 50000"
                          value={efectivoRecibido}
                          onChange={(e) => setEfectivoRecibido(e.target.value)}
                          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '15px' }}
                        />
                        {recibidoNum > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e0' }}>
                            <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Devueltas / Vueltas:</span>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: recibidoNum >= totalCarrito ? '#38a169' : '#e53e3e' }}>
                              {recibidoNum >= totalCarrito ? `$${vueltas}` : 'Dinero insuficiente'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={finalizarVenta}
                      style={{ padding: '12px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '16px', marginTop: '5px' }}
                    >
                      Completar Venta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#edf2f7', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>📜 Historial y Registro de Ventas</h3>
              <div style={{ background: 'white', padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e0', fontWeight: 'bold', color: '#2b6cb0' }}>
                Total Vendido Hoy: ${totalVendidoHoy}
              </div>
            </div>

            {ventas.length === 0 ? (
              <p style={{ color: 'gray' }}>No hay ventas registradas todavía.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: '#2d3748', color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ID Venta</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Fecha y Hora</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Cliente / WhatsApp</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Método Pago</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total Venta</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px' }}>#{v.id}</td>
                      <td style={{ padding: '8px' }}>{new Date(v.fecha).toLocaleString()}</td>
                      <td style={{ padding: '8px' }}>
                        {v.nombre_cliente ? (
                          <div>
                            <strong>{v.nombre_cliente}</strong>
                            <br />
                            <span style={{ fontSize: '12px', color: '#4a5568' }}>📱 {v.telefono_cliente || 'Sin teléfono'}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'gray', fontSize: '13px' }}>Cliente general</span>
                        )}
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', textTransform: 'uppercase' }}>{v.tipo_pago}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#2b6cb0' }}>${v.total_venta}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => eliminarVenta(v.id)}
                          style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: INVENTARIO */}
      {pestana === 'inventario' && (
        <div>
          <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '20px' }}>
            <h3>Registrar Medicamento / Producto</h3>
            <form onSubmit={guardarProducto} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Nombre (ej. Dolex, Acetaminofén)"
                value={nombreProd}
                onChange={(e) => setNombreProd(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Presentación (ej. 500mg x 10 tab, Jarabe 120ml)"
                value={presentacionProd}
                onChange={(e) => setPresentacionProd(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="number"
                placeholder="Unidades / Cantidad Comprada"
                value={stockProd}
                onChange={(e) => setStockProd(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="number"
                placeholder="Costo por Unidad ($)"
                value={costoUnitarioProd}
                onChange={(e) => setCostoUnitarioProd(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="number"
                placeholder="Precio Venta Unitario ($)"
                value={precioProd}
                onChange={(e) => setPrecioProd(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Número de Lote (Opcional, ej. L-45892)"
                value={loteProd}
                onChange={(e) => setLoteProd(e.target.value)}
                style={{ padding: '8px' }}
              />

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', display: 'block' }}>Fecha Vencimiento (opcional):</label>
                <input
                  type="date"
                  value={fechaVenc}
                  onChange={(e) => setFechaVenc(e.target.value)}
                  style={{ padding: '7px', width: '100%' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', background: '#edf2f7', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', color: '#2d3748' }}>
                💡 <strong>Costo Total Calculado de la Factura:</strong> ${costoTotalCalculado}
              </div>

              <button
                type="submit"
                style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
              >
                Guardar Producto
              </button>
            </form>
          </div>

          <h3>Lista de Medicamentos / Productos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#2d3748', color: 'white' }}>
                <th style={{ padding: '8px', textAlign: 'left' }}>Producto / Presentación</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Costo Unit.</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Stock</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Vencimiento</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const estaEditando = editandoId === p.id;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', background: estaEditando ? '#edf2f7' : 'transparent' }}>
                    <td style={{ padding: '8px' }}>
                      {estaEditando ? (
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(e) => setEditNombre(e.target.value)}
                          style={{ padding: '4px', width: '100%' }}
                        />
                      ) : (
                        p.nombre
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      {estaEditando ? (
                        <input
                          type="text"
                          value={editCosto}
                          onChange={(e) => setEditCosto(e.target.value)}
                          style={{ padding: '4px', width: '80px', textAlign: 'right' }}
                        />
                      ) : (
                        `$${p.costo || 0}`
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      {estaEditando ? (
                        <input
                          type="text"
                          value={editPrecio}
                          onChange={(e) => setEditPrecio(e.target.value)}
                          style={{ padding: '4px', width: '80px', textAlign: 'right' }}
                        />
                      ) : (
                        `$${p.precio}`
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      {estaEditando ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(e.target.value)}
                          style={{ padding: '4px', width: '70px', textAlign: 'right' }}
                        />
                      ) : (
                        p.stock
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{p.fecha_vencimiento || 'N/A'}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {estaEditando ? (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => guardarEdicion(p.id)}
                            style={{ backgroundColor: '#38a169', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            💾 Guardar
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            style={{ backgroundColor: '#718096', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            onClick={() => iniciarEdicion(p)}
                            style={{ backgroundColor: '#d69e2e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => eliminarProducto(p.id)}
                            style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            🗑️ Borrar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PESTAÑA: CAJA Y BALANCE GENERAL */}
      {pestana === 'caja' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <h2>Control de Caja Diaria</h2>
            <p><strong>Estado Actual:</strong> <span style={{ color: (caja?.estado || 'cerrada') === 'abierta' ? 'green' : 'red', textTransform: 'uppercase', fontWeight: 'bold' }}>{caja?.estado || 'cerrada'}</span></p>
            <p><strong>Monto Inicial (Base):</strong> ${caja?.monto_inicial || 0}</p>
            <p><strong>Efectivo Esperado en Caja:</strong> ${caja?.efectivo_esperado || 0}</p>

            {(caja?.estado || 'cerrada') === 'cerrada' ? (
              <form onSubmit={abrirCaja} style={{ marginTop: '20px' }}>
                <h4>Abrir Caja de Hoy</h4>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input type="number" placeholder="Monto base ($)" value={montoApertura} onChange={(e) => setMontoApertura(e.target.value)} style={{ padding: '8px', flex: 1 }} />
                  <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Abrir Caja</button>
                </div>
              </form>
            ) : (
              <form onSubmit={cerrarCaja} style={{ marginTop: '20px', background: '#edf2f7', padding: '15px', borderRadius: '6px' }}>
                <h4>Cierre de Caja</h4>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Efectivo contado físicamente en caja:</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" placeholder="Ej. 150000" value={efectivoContado} onChange={(e) => setEfectivoContado(e.target.value)} style={{ padding: '8px', flex: 1 }} />
                  <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Caja</button>
                </div>
              </form>
            )}
          </div>

          <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <h2>📊 Balance General en Tiempo Real</h2>
            {balanceGeneral ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Total Ventas Brutas:</span>
                  <strong>${balanceGeneral.total_ventas_brutas}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Costo Mercancía Vendida:</span>
                  <span style={{ color: '#e53e3e' }}>-${balanceGeneral.total_costos_ventas}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Ganancia Bruta Ventas:</span>
                  <span style={{ color: '#319795', fontWeight: 'bold' }}>${balanceGeneral.ganancia_bruta}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span>Total Gastos Operativos:</span>
                  <span style={{ color: '#e53e3e' }}>-${balanceGeneral.total_gastos_operativos}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#ebf8ff', padding: '10px', borderRadius: '6px', border: '1px solid #bee3f8' }}>
                  <span style={{ fontWeight: 'bold', color: '#2b6cb0' }}>🔥 Ganancia Operativa Real:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2b6cb0' }}>${balanceGeneral.ganancia_operativa_real}</span>
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', color: '#4a5568' }}>
                  <strong>Desglose Medios de Pago:</strong>
                  <div>💵 Efectivo: ${balanceGeneral.ventas_efectivo} \vert{} 📱 Nequi: ${balanceGeneral.ventas_nequi}</div>
                  <div>📱 Daviplata: ${balanceGeneral.ventas_daviplata} \vert{} 💳 Tarjeta: ${balanceGeneral.ventas_tarjeta}</div>
                  <div>📱 Breve: ${balanceGeneral.ventas_breve}</div>
                </div>
              </div>
            ) : (
              <p>Cargando balance...</p>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA: BALANCE HISTÓRICO */}
      {pestana === 'historico' && (
        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
          <h2>📈 Historial de Cierres y Balances Diarios</h2>
          {historialCajas.length === 0 ? (
            <p style={{ color: 'gray' }}>No hay cierres de caja registrados todavía.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#2d3748', color: 'white' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Fecha Cierre</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Ventas Brutas</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Costos</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Ganancia Neta</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Diferencia Caja</th>
                </tr>
              </thead>
              <tbody>
                {historialCajas.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px' }}>{new Date(c.fecha_cierre).toLocaleString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>${c.total_ventas_brutas}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#e53e3e' }}>-${c.total_costos_ventas}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#38a169' }}>${c.ganancia_neta_dia}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: Number(c.diferencia_caja) < 0 ? '#e53e3e' : '#319795' }}>
                      ${c.diferencia_caja || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* PESTAÑA: GASTOS OPERATIVOS */}
      {pestana === 'gastos' && (
        <div>
          <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '20px' }}>
            <h3>Registrar Gasto Operativo (Arriendo, Servicios, etc.)</h3>
            <form onSubmit={registrarGasto} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Concepto (ej. Arriendo local, Recibo de luz)"
                value={conceptoGasto}
                onChange={(e) => setConceptoGasto(e.target.value)}
                style={{ padding: '8px' }}
              />
              <select
                value={categoriaGasto}
                onChange={(e) => setCategoriaGasto(e.target.value)}
                style={{ padding: '8px' }}
              >
                <option value="Fijo">Fijo (Arriendo, Servicios...)</option>
                <option value="Variable">Variable (Aseo, Papelería...)</option>
              </select>
              <input
                type="number"
                placeholder="Monto ($)"
                value={montoGasto}
                onChange={(e) => setMontoGasto(e.target.value)}
                style={{ padding: '8px' }}
              />
              <input
                type="text"
                placeholder="Observación (opcional)"
                value={observacionGasto}
                onChange={(e) => setObservacionGasto(e.target.value)}
                style={{ padding: '8px' }}
              />
              <button
                type="submit"
                style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#319795', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
              >
                Guardar Gasto Operativo
              </button>
            </form>
          </div>

          <h3>Lista de Gastos Operativos</h3>
          {gastos.length === 0 ? (
            <p style={{ color: 'gray' }}>No hay gastos operativos registrados.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '6px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#2d3748', color: 'white' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Concepto</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Categoría</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>{new Date(g.fecha).toLocaleDateString()}</td>
                    <td style={{ padding: '8px' }}>
                      <strong>{g.concepto}</strong>
                      {g.observacion && <div style={{ fontSize: '12px', color: 'gray' }}>{g.observacion}</div>}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{g.categoria}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#e53e3e' }}>${g.monto}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button onClick={() => eliminarGasto(g.id)} style={{ backgroundColor: '#e53e3e', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;