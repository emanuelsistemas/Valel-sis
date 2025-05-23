// Utilitário para suprimir warnings específicos conhecidos
// Este arquivo é uma solução temporária para warnings de bibliotecas deprecated

// Salvar referências originais
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Lista de warnings que devem ser suprimidos
const warningsToSuppress = [
  // react-beautiful-dnd warnings
  'Support for defaultProps will be removed from memo components',
  'Connect(Droppable)',
  'Connect(Draggable)',
  'react-beautiful-dnd',
  'defaultProps will be removed',
  'findDOMNode is deprecated',
  'findDOMNode will be removed',
  'add a ref directly to the element you want to reference',
  'StrictMode findDOMNode',

  // React Router warnings conhecidos (não críticos)
  'React Router Future Flag Warning',
  'v7_startTransition',
  'v7_relativeSplatPath',
  'future flag to opt-in early',
  'React Router will begin wrapping state updates',
  'Relative route resolution within Splat routes'
];

// Função para verificar se deve suprimir
const shouldSuppressMessage = (message: any): boolean => {
  if (typeof message !== 'string') return false;

  return warningsToSuppress.some(warning =>
    message.toLowerCase().includes(warning.toLowerCase())
  );
};

// Substituir console.warn
console.warn = (...args: any[]) => {
  if (shouldSuppressMessage(args[0])) {
    return; // Suprimir este warning
  }
  originalConsoleWarn.apply(console, args);
};

// Substituir console.error para warnings que aparecem como erro
console.error = (...args: any[]) => {
  if (shouldSuppressMessage(args[0])) {
    return; // Suprimir este erro/warning
  }
  originalConsoleError.apply(console, args);
};

export {};
