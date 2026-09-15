import urllib.request,time,json,re,concurrent.futures,gzip,sys
base=sys.argv[1] if len(sys.argv)>1 else 'https://www.melega.finance'
def get(path):
 t=time.monotonic()
 try:
  with urllib.request.urlopen(urllib.request.Request(base+path,headers={'Accept-Encoding':'gzip'}),timeout=45) as r:
   first=time.monotonic()-t;raw=r.read();body=gzip.decompress(raw) if r.headers.get('Content-Encoding')=='gzip' else raw
   return {'path':path,'status':r.status,'ttfbMs':round(first*1000),'totalMs':round((time.monotonic()-t)*1000),'wireBytes':len(raw),'decodedBytes':len(body),'cache':r.headers.get('x-vercel-cache'),'cacheControl':r.headers.get('Cache-Control')},body
 except Exception as e:return {'path':path,'error':str(e),'totalMs':round((time.monotonic()-t)*1000)},b''
h,body=get('/');scripts=list(dict.fromkeys(re.findall(r'<script[^>]*src="([^"]+)"',body.decode())))
paths=['/api/market-data/top-movers','/api/market-data/snapshot','/api/indexer/featured-markets/']
if len(sys.argv)>2:
 scripts=json.load(open(sys.argv[2]))['dom']['scripts']; paths=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:apis=list(pool.map(get,paths))
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:assets=list(pool.map(get,[s for s in scripts if s.startswith('/_next/')]))
result={'base':base,'home':h,'apis':[a[0] for a in apis],'scripts':[a[0] for a in assets],'initialJsWireBytes':sum(a[0].get('wireBytes',0) for a in assets),'initialJsDecodedBytes':sum(a[0].get('decodedBytes',0) for a in assets)}
print(json.dumps(result,indent=2))
