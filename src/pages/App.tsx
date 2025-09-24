import React, { useEffect, useMemo, useState } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider, useAuthActions, useAuthToken } from '@convex-dev/auth/dist/react';
import { useQuery, useMutation } from 'convex/react';
import * as Icons from 'lucide-react';
import { createPortal } from 'react-dom';

const convexUrl = import.meta.env.VITE_CONVEX_URL as string;
const convex = new ConvexReactClient(convexUrl);

function AuthGate({ children }: { children: React.ReactNode }){
  const token = useAuthToken();
  const { signIn, signOut } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return token ? (
    <div className="container my-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Arkan</h1>
        <button className="btn" onClick={() => signOut()}>Logout</button>
      </div>
      {children}
    </div>
  ) : (
    <div className="container min-h-screen grid place-items-center">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">{mode==='signin'? 'Sign in' : 'Sign up'}</h2>
        <form className="space-y-3" onSubmit={async e => {
          e.preventDefault(); setError(null);
          try{
            const { signingIn } = await signIn('password', { email, password });
            if (!signingIn) {
              alert('Check your email for verification if required.');
            }
          }catch(err:any){ setError(err.message || String(err)); }
        }}>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">{mode==='signin'?'Sign in':'Create account'}</button>
            <button type="button" className="btn" onClick={()=>setMode(m=>m==='signin'?'signup':'signin')}>
              {mode==='signin'? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductForm(){
  const create = useMutation('products:create' as any);
  const uploadUrl = useMutation('products:uploadUrl' as any);
  const [name,setName]=useState('');
  const [description,setDescription]=useState('');
  const [price,setPrice]=useState<number>(0);
  const [category,setCategory]=useState('');
  const [file,setFile]=useState<File|undefined>();
  const [busy,setBusy]=useState(false);

  return (
    <form className="card space-y-3" onSubmit={async e=>{
      e.preventDefault(); setBusy(true);
      let imageId: string | undefined = undefined;
      try{
        if(file){
          const url = await uploadUrl({ contentType: file.type });
          const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
          const json = await res.json();
          imageId = json.storageId;
        }
        await create({ name, description, price: Number(price), category, imageId });
        setName(''); setDescription(''); setPrice(0); setCategory(''); setFile(undefined);
      } finally { setBusy(false); }
    }}>
      <h3 className="text-lg font-medium">Add Product</h3>
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" value={description} onChange={e=>setDescription(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Price</label>
          <input className="input" type="number" value={price} onChange={e=>setPrice(Number(e.target.value))} required />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input" value={category} onChange={e=>setCategory(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Image</label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0])} />
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy? 'Saving...' : 'Save product'}</button>
    </form>
  )
}

function ProductsTable(){
  const products = useQuery('products:list' as any) as any[] | undefined;
  const update = useMutation('products:update' as any);
  const remove = useMutation('products:remove' as any);

  if(!products) return <div className="card">Loading...</div>
  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-2">Products</h3>
      <table className="table">
        <thead><tr>
          <th>Name</th><th>Category</th><th>Price</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {products.map(p=> (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${'{'}p.price.toFixed(2){'}'}</td>
              <td>{p.active? 'Active' : 'Inactive'}</td>
              <td className="flex gap-2">
                <button className="btn" onClick={()=>update({ id: p._id, active: !p.active })}>{p.active?'Deactivate':'Activate'}</button>
                <button className="btn" onClick={()=>remove({ id: p._id })}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Orders(){
  const orders = useQuery('orders:list' as any) as any[] | undefined;
  const updateStatus = useMutation('orders:updateStatus' as any);
  if(!orders) return <div className="card">Loading...</div>
  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-2">Orders</h3>
      <table className="table">
        <thead><tr>
          <th>Items</th><th>Total</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {orders.map(o=> (
            <tr key={o._id}>
              <td>{o.items.length}</td>
              <td>${'{'}o.total.toFixed(2){'}'}</td>
              <td>{o.status}</td>
              <td className="flex gap-2">
                {['pending','shipped','completed'].map(s=> (
                  <button key={s} className="btn" onClick={()=>updateStatus({ id: o._id, status: s as any })}>{s}</button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Analytics(){
  const metrics = useQuery('analytics:metrics' as any) as any;
  if(!metrics) return <div className="card">Loading...</div>
  return (
    <div className="grid md:grid-cols-4 gap-3">
      <div className="card"><div className="text-zinc-400">Products</div><div className="text-2xl">{metrics.products}</div></div>
      <div className="card"><div className="text-zinc-400">Active Orders</div><div className="text-2xl">{metrics.activeOrders}</div></div>
      <div className="card"><div className="text-zinc-400">Completed</div><div className="text-2xl">{metrics.completedOrders}</div></div>
      <div className="card"><div className="text-zinc-400">Activity</div><div className="text-2xl">{metrics.activityCount}</div></div>
    </div>
  )
}

function Dashboard(){
  return (
    <div className="space-y-4">
      <Analytics/>
      <ProductForm/>
      <ProductsTable/>
      <Orders/>
    </div>
  );
}

export default function App(){
  return (
    <ConvexAuthProvider client={convex}>
      <AuthGate>
        <Dashboard/>
      </AuthGate>
    </ConvexAuthProvider>
  );
}
