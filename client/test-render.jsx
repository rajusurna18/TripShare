import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import Contact from './src/pages/Contact.jsx';

try {
  const html = renderToString(
    <StaticRouter>
      <Contact />
    </StaticRouter>
  );
  console.log("RENDER SUCCESS!");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
