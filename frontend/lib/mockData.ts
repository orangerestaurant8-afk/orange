export type Category = 'Fast Food' | 'Chinese Food' | 'BBQ';
export type Dish = { id: string; name: string; category: Category; restaurant: string; description: string; price: number; rating: number; image: string; popular?: boolean };

export const categories: Array<{ name: Category; image: string }> = [
  { name: 'Fast Food', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Chinese Food', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80' },
  { name: 'BBQ', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' },
];

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;
export const dishes: Dish[] = [
  { id:'zinger-burger',name:'Mighty Zinger Burger',category:'Fast Food',restaurant:'Burger Lab Karachi',description:'Crispy chicken fillet, spicy mayo and fresh lettuce.',price:695,rating:4.8,image:img('photo-1568901346375-23c9450c58cd'),popular:true },
  { id:'loaded-fries',name:'Loaded Masala Fries',category:'Fast Food',restaurant:'Howdy',description:'Crisp fries, jalapeños, cheese sauce and chicken.',price:450,rating:4.6,image:img('photo-1573080496219-bb080dd4f877'),popular:true },
  { id:'chapli-burger',name:'Chapli Kebab Burger',category:'Fast Food',restaurant:'Kababjees',description:'Chargrilled chapli kebab in a toasted brioche bun.',price:620,rating:4.7,image:img('photo-1550547660-d9450f859349') },
  { id:'pizza-slice',name:'Tandoori Chicken Pizza',category:'Fast Food',restaurant:'14th Street Pizza',description:'Smoky tandoori chicken, onion and mozzarella.',price:1150,rating:4.7,image:img('photo-1574071318508-1cdbab80d002') },
  { id:'chow-mein',name:'Chicken Chow Mein',category:'Chinese Food',restaurant:'Ginsoy',description:'Wok-tossed noodles with chicken and crunchy vegetables.',price:790,rating:4.6,image:img('photo-1585032226651-759b368d7246'),popular:true },
  { id:'chilli-chicken',name:'Chilli Chicken Dry',category:'Chinese Food',restaurant:'Chop Chop Wok',description:'Crispy chicken tossed with peppers and hot chilli sauce.',price:920,rating:4.8,image:img('photo-1601050690597-df0568f70950') },
  { id:'fried-rice',name:'Special Fried Rice',category:'Chinese Food',restaurant:'Ginsoy',description:'Fragrant rice with chicken, egg and vegetables.',price:690,rating:4.5,image:img('photo-1603133872878-684f208fb84b') },
  { id:'dumplings',name:'Chicken Dumplings',category:'Chinese Food',restaurant:'East End',description:'Six steamed dumplings with chilli oil dip.',price:560,rating:4.7,image:img('photo-1496116218417-1a781b1c416c') },
  { id:'malai-boti',name:'Chicken Malai Boti',category:'BBQ',restaurant:'Bar.B.Q Tonight',description:'Creamy, charcoal-grilled boneless chicken skewers.',price:980,rating:4.9,image:img('photo-1532550907401-a500c9a57435'),popular:true },
  { id:'seekh-kebab',name:'Beef Seekh Kebab',category:'BBQ',restaurant:'Kababjees',description:'Two juicy beef kebabs, charcoal grilled.',price:720,rating:4.8,image:img('photo-1529193591184-b1d58069ecdd') },
  { id:'bbq-platter',name:'Smoky BBQ Platter',category:'BBQ',restaurant:'Kolachi',description:'Malai boti, seekh kebab, tikka and naan.',price:1850,rating:4.9,image:img('photo-1544025162-d76694265947'),popular:true },
  { id:'karahi',name:'Chicken Karahi',category:'BBQ',restaurant:'Sajjad Restaurant',description:'Half karahi cooked with tomatoes and green chilli.',price:1450,rating:4.8,image:img('photo-1565557623262-b51c2513a641') },
  { id:'club-sandwich',name:'Chicken Club Sandwich',category:'Fast Food',restaurant:'Cafe Flo',description:'Triple-decker grilled chicken club with fries.',price:780,rating:4.5,image:img('photo-1550507992-eb63ffee0847') },
  { id:'wings',name:'Hot & Spicy Wings',category:'Fast Food',restaurant:'KFC Pakistan',description:'Eight fiery crispy chicken wings.',price:590,rating:4.6,image:img('photo-1527477396000-e27163b481c2') },
  { id:'hot-sour',name:'Hot & Sour Soup',category:'Chinese Food',restaurant:'Ginsoy',description:'A warming bowl with chicken and vegetables.',price:420,rating:4.4,image:img('photo-1547592180-85f173990554') },
  { id:'chicken-tikka',name:'Chicken Tikka',category:'BBQ',restaurant:'Al Habib',description:'Spiced half chicken, grilled over charcoal.',price:760,rating:4.7,image:img('photo-1599487488170-d11ec9c172f0') },
];
export const pkr = (value: number) => `₨ ${value.toLocaleString('en-PK')}`;
