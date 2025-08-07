import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:3001/api/configuracion';

export const useConfiguracion = () => {
  const { auth } = useAuth();
  const [configSistema, setConfigSistema] = useState(null);
  const [configSucursal, setConfigSucursal] = useState(null);
  const [configImpresion, setConfigImpresion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Headers con token para autenticación
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${auth?.token}`,
  });

  useEffect(() => {
    if (!auth) return;

    const fetchConfiguraciones = async () => {
      try {
        setLoading(true);
        setError(null);

        // Configuración sistema global
        const resSistema = await fetch(`${API_BASE}/sistema`, {
          headers: getHeaders(),
        });
        const dataSistema = await resSistema.json();

        // Configuración sucursal
        const resSucursal = await fetch(`${API_BASE}/sucursal/${auth.sucursal_id}`, {
          headers: getHeaders(),
        });
        const dataSucursal = await resSucursal.json();

        // Configuración impresión
        const resImpresion = await fetch(`${API_BASE}/impresion/${auth.sucursal_id}`, {
          headers: getHeaders(),
        });
        const dataImpresion = await resImpresion.json();

        setConfigSistema(dataSistema);
        setConfigSucursal(dataSucursal);
        setConfigImpresion(dataImpresion);
      } catch (err) {
        setError('Error cargando configuraciones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfiguraciones();
  }, [auth]);

  // Funciones para actualizar configs
  const updateConfigSistema = async (newConfig) => {
    const res = await fetch(`${API_BASE}/sistema`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(newConfig),
    });
    const data = await res.json();
    setConfigSistema(data);
    return data;
  };

  const updateConfigSucursal = async (newConfig) => {
    const res = await fetch(`${API_BASE}/sucursal/${auth.sucursal_id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(newConfig),
    });
    const data = await res.json();
    setConfigSucursal(data);
    return data;
  };

  const updateConfigImpresion = async (newConfig) => {
    const res = await fetch(`${API_BASE}/impresion/${auth.sucursal_id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(newConfig),
    });
    const data = await res.json();
    setConfigImpresion(data);
    return data;
  };

  return {
    configSistema,
    configSucursal,
    configImpresion,
    loading,
    error,
    updateConfigSistema,
    updateConfigSucursal,
    updateConfigImpresion,
  };
};
