export function parseBoard(board) {
  const cells = new Map();
  [...board].forEach((id, i) => { if (id !== 'o') { if (!cells.has(id)) cells.set(id, []); cells.get(id).push(i); } });
  return [...cells].sort(([a], [b]) => a.localeCompare(b)).map(([id, p]) => ({ id, x:p[0]%6, y:Math.floor(p[0]/6), length:p.length, horizontal:p[1]===p[0]+1 }));
}
export function limits(cars, id) {
  const car=cars.find(c=>c.id===id), occupied=new Set();
  for(const c of cars) if(c.id!==id) for(let i=0;i<c.length;i++) occupied.add((c.y+(c.horizontal?0:i))*6+c.x+(c.horizontal?i:0));
  const pos=car.horizontal?car.x:car.y;
  const clear=p=>!occupied.has((car.horizontal?car.y:p)*6+(car.horizontal?p:car.x));
  let min=pos,max=pos;
  while(min>0 && clear(min-1))min--;
  while(max+car.length<6 && clear(max+car.length))max++;
  return {min,max};
}
export function move(cars,id,pos) {
  const car=cars.find(c=>c.id===id), {min,max}=limits(cars,id);
  if(!Number.isInteger(pos)||pos<min||pos>max)return false;
  const axis=car.horizontal?'x':'y';
  if(car[axis]===pos)return false;
  car[axis]=pos;return true;
}
export function won(cars){return cars.some(c=>c.id==='A'&&c.x+c.length===6);}
