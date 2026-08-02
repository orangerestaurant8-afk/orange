'use client';

import { useState } from 'react';
import { AdminMobileNav, AdminSidebar, AdminStatCard, Badge, BottomSheet, Button, CustomerNavBar, DishCard, Input, Modal, OrderCard, QuantityStepper, Select, Textarea, Toast } from '@/components/ui';

export default function StyleGuidePage() {
  const [modal, setModal] = useState(false); const [sheet, setSheet] = useState(false); const [nav, setNav] = useState(false); const [toast, setToast] = useState(true);
  return <main className="min-h-screen bg-neutral-canvas text-neutral-copy"><CustomerNavBar /><div className="mx-auto max-w-screen-xl space-y-12 p-6"><header><p className="text-overline font-bold text-orange-800">Orange UI</p><h1 className="font-display text-display-sm text-neutral-ink">Component style guide</h1></header>
    <Section title="Buttons"><div className="flex flex-wrap gap-4"><Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="icon">⌕</Button><Button loading>Loading</Button><Button disabled>Disabled</Button></div></Section>
    <Section title="Status badges"><div className="flex flex-wrap gap-3">{(['New','Preparing','Out for Delivery','Delivered','Cancelled'] as const).map(status => <Badge key={status} status={status}/>)}</div></Section>
    <Section title="Cards"><div className="grid gap-6 md:grid-cols-3"><DishCard/><OrderCard/><AdminStatCard label="Today's Revenue" value="₨ 45,200" /></div></Section>
    <Section title="Form controls"><div className="grid gap-4 md:grid-cols-2"><Input label="Delivery address" placeholder="Enter your address"/><Select label="Payment method"><option>Cash on delivery</option><option>Card</option></Select><Textarea label="Delivery note" placeholder="Add a note for the rider"/><div><p className="mb-2 text-body-sm font-semibold">Quantity</p><QuantityStepper/></div></div></Section>
    <Section title="Overlays & notifications"><div className="flex flex-wrap gap-4"><Button onClick={() => setModal(true)}>Open modal</Button><Button variant="secondary" onClick={() => setSheet(true)}>Open bottom sheet</Button>{toast && <Toast message="Item added to your cart" onClose={() => setToast(false)}/>} {!toast && <Button variant="ghost" onClick={() => setToast(true)}>Show toast</Button>}</div></Section>
    <Section title="Admin navigation"><div className="overflow-hidden rounded-xl"><AdminMobileNav onOpen={() => setNav(true)}/><div className="hidden h-72 md:block"><AdminSidebar/></div></div></Section>
  </div><Modal open={modal} title="Remove item?" onClose={() => setModal(false)}><p className="text-body-sm text-neutral-muted">This action can be undone from your cart.</p><div className="mt-6 flex justify-end gap-3"><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Confirm</Button></div></Modal><BottomSheet open={sheet} title="Order details" onClose={() => setSheet(false)}><p className="text-body-sm text-neutral-muted">Your order will be delivered in 30–40 minutes.</p></BottomSheet><AdminSidebar mobile open={nav} onClose={() => setNav(false)}/></main>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="space-y-4"><h2 className="font-display text-heading-md text-neutral-ink">{title}</h2>{children}</section>; }
