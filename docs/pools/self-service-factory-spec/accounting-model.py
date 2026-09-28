import random
Q=10**27
steps=0
for seed in range(200):
 r=random.Random(seed); start=10;end=1010;rate=r.randint(1,10**9);budget=rate*(end-start)
 users=[dict(amount=0,paid=0,accrued=0,rem=0) for _ in range(8)]
 S=acc=alloc=paid=ref=0;last=start;b=0
 def checkpoint(t):
  global last,alloc,acc
  t=min(max(t,start),end); e=(t-last)*rate
  if S: alloc+=e;acc+=e*Q//S
  last=t
 def user_checkpoint(u):
  w,f=divmod(u['amount']*(acc-u['paid']),Q);v=f+u['rem']
  u['accrued']+=w+v//Q;u['rem']=v%Q;u['paid']=acc
 for _ in range(500):
  b+=r.randrange(5);checkpoint(b);u=r.choice(users);user_checkpoint(u);action=r.randrange(4)
  if action==0 and start<=b<end:
   a=r.randint(1,10**18);u['amount']+=a;S+=a
  elif action==1 and u['amount']:
   a=r.randint(1,u['amount']);u['amount']-=a;S-=a
  elif action==2:paid+=u['accrued'];u['accrued']=0
  elif action==3 and b>=end:ref=budget-alloc
  liability=sum(x['accrued']+(x['amount']*(acc-x['paid'])+x['rem'])//Q for x in users)
  assert S==sum(x['amount'] for x in users)
  assert 0<=paid<=alloc<=budget and ref<=budget-alloc
  assert liability<=alloc-paid
  assert all(0<=x['rem']<Q for x in users)
  steps+=1
 checkpoint(end)
 for u in users:user_checkpoint(u);paid+=u['accrued'];u['accrued']=0
 ref=budget-alloc
 assert paid+ref<=budget
print(f'PASS: {steps} deterministic model transitions, 200 seeds; integer conservation/reserve/rounding checks. Specification arithmetic only, not contract certification.')
