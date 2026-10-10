/**
 * Mounts the real providers + cart drawer + menu, exactly like app/layout.tsx and app/menu/page.tsx,
 * and exposes the live cart API on window for the browser tests.
 */
import { createRoot } from 'react-dom/client';
import CartDrawer from '../../components/cart/CartDrawer';
import { CartProvider, useCart } from '../../components/cart/CartContext';
import Menu from '../../components/Menu';
import { SiteProvider, useWhatsapp } from '../../components/SiteContext';
import { getMenu } from '../../lib/menu';
import { getSite } from '../../lib/site-data';

function Probe() {
  const cart = useCart();
  const wa = useWhatsapp(); // same link builder the footer / floating button / hero use
  const w = window as any;
  w.__cart = cart;
  w.__wa = wa;
  return null;
}

(async () => {
  const site = await getSite(); // what layout.tsx does at build time
  const menu = await getMenu(); // what app/menu/page.tsx does
  createRoot(document.getElementById('root')!).render(
    <SiteProvider value={site}>
      <CartProvider>
        <Probe />
        <Menu menu={menu} />
        <CartDrawer />
      </CartProvider>
    </SiteProvider>,
  );
  (window as any).__ready = true;
})();
