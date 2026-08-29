import React, { useState } from 'react';
import { CovalentFramebufferMirror } from './components/views/CovalentFramebufferMirror';
import { SysArchConsole } from './components/SysArchConsole';
import { AsmTelemetryProvider } from './context/AsmTelemetryContext';
import { BeSingletonProvider } from './context/BeSingletonContext';

/**
 * ============================================================================
 * App.tsx — KIOSK STATE ROUTING & ADMINISTRATIVE DASHBOARD REHYDRATION
 * 
 * - Default Entry Point: Full Screen Face (Carbon & Silicon Hybrid Visage)
 * - isKioskMode === true  -> Exclusively renders the full-screen CovalentFramebufferMirror
 * - isKioskMode === false -> Renders the full multi-tier SysArchConsole administrative dashboard
 * ============================================================================
 */
export default function App() {
  // Default entry point: Full Screen Face with Local LLMs active on load
  const [isKioskMode, setIsKioskMode] = useState<boolean>(true);

  return (
    <AsmTelemetryProvider>
      <BeSingletonProvider>
        {isKioskMode ? (
          <CovalentFramebufferMirror
            isFullScreen={true}
            onExitKiosk={() => setIsKioskMode(false)}
          />
        ) : (
          <SysArchConsole
            onEnterKiosk={() => setIsKioskMode(true)}
          />
        )}
      </BeSingletonProvider>
    </AsmTelemetryProvider>
  );
}

