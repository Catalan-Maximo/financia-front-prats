import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TestPerfilScreen from './src/screens/TestPerfilScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AsesorVirtualScreen from './src/screens/AsesorVirtualScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CriptoDetalleScreen from './src/screens/CriptoDetalleScreen';
import MercadosScreen from './src/screens/MercadosScreen';
import ChatScreen from './src/screens/ChatScreen';
import PackDetailScreen from './src/screens/PackDetailScreen';
import VersusScreen from './src/screens/VersusScreen';
import ActivoDetalleScreen from './src/screens/ActivoDetalleScreen';
import AccionDetalleScreen from './src/screens/AccionDetalleScreen';
import CriptoInfoScreen from './src/screens/CriptoInfoScreen';
import NoticiasScreen from './src/screens/NoticiasScreen';
import MiDineroScreen from './src/screens/MiDineroScreen';
import BottomNav, { TabKey } from './src/components/BottomNav';
import Entrada from './src/components/Entrada';
import PanelPerfil from './src/components/PanelPerfil';
import FaqSheet from './src/components/FaqSheet';
import TopBar from './src/components/TopBar';
import usePerfilGuardado from './src/hooks/usePerfilGuardado';
import { useAuth } from './src/hooks/AuthContext';
import { borrarPerfil } from './src/lib/storage';
import { registrarNotificaciones } from './src/lib/notificaciones';
import { useTheme } from './src/theme/colors';
import type { CriptoEstado, CriptoInfo } from './src/domain/cripto';
import type { PackCotizacion, AccionCotizacion } from './src/domain/mercados';
import type { Activo } from './src/domain/activo';

export default function App() {
  const [perfilUsuario, setPerfilUsuario] = useState<string>('Moderado');
  const [testCompletado, setTestCompletado] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(false);
  const [modoAuth, setModoAuth] = useState<'login' | 'register'>('login');
  const [criptoDetalle, setCriptoDetalle] = useState<CriptoEstado | null>(null);
  const [packDetalle, setPackDetalle] = useState<PackCotizacion | null>(null);
  const [versusAbierto, setVersusAbierto] = useState(false);
  const [activoDetalle, setActivoDetalle] = useState<Activo | null>(null);
  const [accionDetalle, setAccionDetalle] = useState<AccionCotizacion | null>(null);
  const [criptoInfo, setCriptoInfo] = useState<CriptoInfo | null>(null);
  const [noticiasAbierto, setNoticiasAbierto] = useState(false);
  const { token, email, perfilInversor, cargando: cargandoAuth, logout } = useAuth();
  const { perfilGuardado, cargando: cargandoPerfil } = usePerfilGuardado();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const manejarTestCompleto = (perfilAsignado: string) => {
    setPerfilUsuario(perfilAsignado);
    setTestCompletado(true); // A partir de acá, mostramos las pestañas
  };

  // Vuelve al onboarding para rehacer el test del inversor
  const rehacerTest = async () => {
    await borrarPerfil();
    setPanelAbierto(false);
    setActiveTab('dashboard');
    setTestCompletado(false);
  };

  // Cierra sesión: borra token y perfil, vuelve al login
  const cerrarSesion = async () => {
    await logout();
    await borrarPerfil();
    setPanelAbierto(false);
    setActiveTab('dashboard');
    setTestCompletado(false);
    setPerfilUsuario('Moderado');
  };

  // Si hay un perfil guardado de una sesión anterior, saltamos el test
  useEffect(() => {
    if (perfilGuardado) {
      setPerfilUsuario(perfilGuardado);
      setTestCompletado(true);
    }
  }, [perfilGuardado]);

  // Si el usuario logueado ya tiene perfil en el backend (vino en el login),
  // saltamos el test — así no hay que rehacerlo en cada login
  useEffect(() => {
    if (perfilInversor) {
      setPerfilUsuario(perfilInversor);
      setTestCompletado(true);
    }
  }, [perfilInversor]);

  // Registrar notificaciones push una vez logueado
  useEffect(() => {
    if (token) {
      registrarNotificaciones();
    }
  }, [token]);

  const renderPantalla = () => {
    switch (activeTab) {
      case 'mercados':
        return (
          <MercadosScreen
            onAbrirPack={setPackDetalle}
            onAbrirDetalleCripto={setCriptoDetalle}
            onAbrirVersus={() => setVersusAbierto(true)}
            onAbrirAccion={setAccionDetalle}
            onAbrirCriptoInfo={setCriptoInfo}
          />
        );
      case 'midinero':
        return <MiDineroScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'simulador':
        return <AsesorVirtualScreen perfil={perfilUsuario} />;
      default:
        return (
          <DashboardScreen
            perfil={perfilUsuario}
            onIrAlSimulador={() => setActiveTab('simulador')}
            onAbrirDetalleCripto={setCriptoDetalle}
            onAbrirPack={setPackDetalle}
            onAbrirDetalleActivo={setActivoDetalle}
          />
        );
    }
  };

  // Detalle de cripto: pantalla completa encima del flujo con pestañas
  if (criptoDetalle) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CriptoDetalleScreen estado={criptoDetalle} onVolver={() => setCriptoDetalle(null)} />
      </SafeAreaProvider>
    );
  }

  // Noticias financieras
  if (noticiasAbierto) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <NoticiasScreen onVolver={() => setNoticiasAbierto(false)} />
      </SafeAreaProvider>
    );
  }

  // VERSUS: comparación cara a cara
  if (versusAbierto) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <VersusScreen onVolver={() => setVersusAbierto(false)} />
      </SafeAreaProvider>
    );
  }

  // Detalle informativo de una cripto extra
  if (criptoInfo) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <CriptoInfoScreen info={criptoInfo} onVolver={() => setCriptoInfo(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de una acción (precio, gráfico y fundamentales)
  if (accionDetalle) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AccionDetalleScreen cotizacion={accionDetalle} onVolver={() => setAccionDetalle(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de un activo de renta fija (tendencia de 30 días)
  if (activoDetalle) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ActivoDetalleScreen activo={activoDetalle} onVolver={() => setActivoDetalle(null)} />
      </SafeAreaProvider>
    );
  }

  // Detalle de pack: composición y acceso al simulador
  if (packDetalle) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <PackDetailScreen
          pack={packDetalle}
          onVolver={() => setPackDetalle(null)}
        />
      </SafeAreaProvider>
    );
  }

  // Splash de arranque mientras leemos el storage (token + perfil)
  if (cargandoAuth || cargandoPerfil) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={s.splash}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sin token → flujo de autenticación (login/registro)
  if (!token) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {modoAuth === 'login' ? (
          <LoginScreen onIrARegistro={() => setModoAuth('register')} />
        ) : (
          <RegisterScreen onIrALogin={() => setModoAuth('login')} />
        )}
      </SafeAreaProvider>
    );
  }

  // El test es onboarding: pantalla única, sin pestañas.
  // Las pestañas aparecen recién cuando el usuario completa el test.
  if (!testCompletado) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <TestPerfilScreen onTestComplete={manejarTestCompleto} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <View style={s.container}>
        <TopBar
          onAbrirPanel={() => setPanelAbierto(true)}
          onAbrirFaq={() => setFaqAbierto(true)}
        />
        <Entrada key={activeTab} style={s.contenido}>
          {renderPantalla()}
        </Entrada>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        <PanelPerfil
          visible={panelAbierto}
          perfil={perfilUsuario}
          email={email ?? ''}
          onClose={() => setPanelAbierto(false)}
          onNavegar={setActiveTab}
          onAbrirFaq={() => setFaqAbierto(true)}
          onAbrirVersus={() => setVersusAbierto(true)}
          onAbrirNoticias={() => setNoticiasAbierto(true)}
          onRehacerTest={rehacerTest}
          onLogout={cerrarSesion}
        />
        <FaqSheet visible={faqAbierto} onClose={() => setFaqAbierto(false)} />
      </View>
    </SafeAreaProvider>
  );
}

const makeStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.systemBackground },
    contenido: { flex: 1 },
    splash: { flex: 1, backgroundColor: colors.systemBackground, alignItems: 'center', justifyContent: 'center' },
  });
