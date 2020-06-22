
function padTime(n){//pad number to 2 chars
    return n>9&&n||`0${n}`;
}

export class Utils{
    static clamp(num,min,max){
        return num<min?min:(num>max?max:num);
    }
    static isObject(obj){
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    static deepAssign(target,...args){
        //本函数不处理循环引用
        let obj=args.shift();
        if(target===null || target===undefined || typeof target !== 'object'){
            throw(new TypeError('target should be an object'));
        }
        if(!Utils.isObject(obj)){//obj不是对象则跳过
            if(args.length===0)return target;//没有参数了就返回结果
            return Utils.deepAssign(target,...args);//提取一个参数出来继续
        }
        for(let i in obj){//遍历obj
            if(Utils.isObject(obj[i])){//是个子对象
                if(!Utils.isObject(target[i]))target[i]={};
                Utils.deepAssign(target[i],obj[i]);//递归
            }else{
                target[i]=obj[i];//直接赋值
            }
        }
        if(args.length===0)return target;
        return Utils.deepAssign(target,...args);
    }
    static formatTime(sec,total){
        if(total==undefined)total=sec;
        let r,s=sec|0,h=(s/3600)|0;
        if(total>=3600)s=s%3600;
        r=[padTime((s/60)|0),padTime(s%60)];
        (total>=3600)&&r.unshift(h);
        return r.join(':');
    }
    static rand(min, max) {
        return (min+Math.random()*(max-min)+0.5)|0;
    }
    static toArray(obj){
        if(obj instanceof Array)return obj.slice();
        if(obj.length!==undefined)
            return Array.prototype.slice.call(obj);
        return [...obj];
    }
    static animationFrameLoop(cb){
        requestAnimationFrame(()=>{
           if(cb()===false)return;;
           Utils.animationFrameLoop(cb);
        });
    }
    static requestIdleCallback=window.requestIdleCallback?.bind(window)||setImmediate;
}
