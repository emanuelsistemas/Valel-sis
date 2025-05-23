import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import './index.css';
// Importar utilitário para suprimir warnings do react-beautiful-dnd
import './utils/suppressWarnings';

createRoot(document.getElementById('root')!).render(
  // StrictMode temporariamente desabilitado devido aos warnings do react-beautiful-dnd
  // TODO: Reabilitar após migração para @hello-pangea/dnd
  // <StrictMode>
    <>
      <App />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  // </StrictMode>
);