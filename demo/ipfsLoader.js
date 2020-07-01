/*
copyright 2018 luojia@luojia.me
*/
({
	name:'ipfsLoader',
	init(NP){
		function removeEtxSlash(str){
			let result;
			//remove extra slashes in the path
			try{//chrome
				var reg=new RegExp('(?<!\:)\/{2,}','g');
				result=str.replace(reg,'/');
			}catch(e){//for others
				// console.log('fallback')
				var rand;
				while(str.indexOf((rand=Math.random().toString()))>=0);
				result=str.replace(/\:\//g,rand).replace(/\/{2,}/g,'/').replace(new RegExp(rand,'g'),':/');
			}
			return result;
		}
		function toIPFSPath(addr){
			addr=removeEtxSlash(addr.trim());
			if(addr.startsWith('/ipns/'))return addr;
			var r;
			if(r=addr.match(/Qm[A-z\d]{44}.*$/)){
				return removeEtxSlash(`/ipfs/${r[0]}`);
			}
			throw(new Error('Cannot parse IPFS path'));
		}
		class fetch_controllable{
			constructor(url,opt=null){
				this.controller = new AbortController();
				this.url=url;
				this.fetch=fetch(url,Object.assign({signal:this.controller.signal},opt));
			}
			abort(){
				this.controller.abort();
			}
			then(...args){
				this.fetch=this.fetch.then(...args);
				return this;
			}
			catch(...args){
				this.fetch=this.fetch.catch(...args);
				return this;
			}
			finally(...args){
				//微软版edge不支持finally你敢信？
				if(!this.fetch.finally){
					return this.then(...args);
				}
				this.fetch=this.fetch.finally(...args);
				return this;
			}
		}
		function fetch_c(url,opt){
			return new fetch_controllable(url,opt);
		}
		class GatewayTester{
			constructor(){
				this.testingFetch_c=new Set();
			}
			stop(){
				if(this.testingFetch_c.size){
					for(let f of this.testingFetch_c){f.abort();}
				}
			}
			test(gateway,path='QmVnS9etu7B3wN9S7DwRCtM37pwx6XJ3b48ag9A8H1akAc'){
				let url=removeEtxSlash(`${gateway}${toIPFSPath(path)}`);
				let f=fetch_c(url,{
					method:'HEAD',
				}).then(()=>{
					return url;
				}).finally(()=>{
					this.testingFetch_c.delete(f);
					return url;//不要删除这个
				});
				this.testingFetch_c.add(f);
				return f;
			}
		}

		var defaultGatewayList=[
			"https://ipfs.io/",
			"https://gateway.ipfs.io/",
			"https://ipfs.infura.io/",
			"https://xmine128.tk/",
			"https://ipfs.jes.xxx/",
			"https://siderus.io/",
			"https://ipfs.eternum.io/",
			"https://hardbin.com/",
			"https://ipfs.wa.hle.rs/",
			"https://ipfs.renehsz.com/",
			"https://cloudflare-ipfs.com/",
			"https://gateway.swedneck.xyz/",
			"https://rx14.co.uk/",
			"https://ipfs.wa.hle.rs/",
			"https://ipfs.macholibre.org/",
			"https://gateway.blocksec.com/",
			"https://io.luojia.me/",
			"http://127.0.0.1:8080/",
		];
		let tester=new GatewayTester();
		NP.addURLResolver((src)=>{
			let r;
			if(r=src.trim().match(/^"ipfs":(.*)$/)){
				NP.stat('寻找ipfs网关');
				let path=toIPFSPath(r[1]),hadResult=false;
				return new Promise((ok,no)=>{
					for(let g of defaultGatewayList){
						tester.test(g,path)
						.then(url=>{
							NP.statResult('寻找ipfs网关');
							hadResult=true;
							tester.stop();
							ok(url);
						}).catch(e=>{}).finally(()=>{
							if(tester.testingFetch_c.size===0 && !hadResult){
								NP.statResult('寻找ipfs网关','找不到可用ipfs网关');
								no();
							}
						});
					}
				});
			}
			return undefined;//not resolved
		},1);
		
		NP.log('ipfsLoader Loaded');
	}
})