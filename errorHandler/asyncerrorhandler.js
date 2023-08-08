module.exports.asyncErrorHandler = function(fn){
    return async function(req, res, next){
        try{
            await fn(req, res, next)
        }catch(err){
            if(err.name == "JsonWebTokenError"){
                return res.status(401).json({data: null, success: false, message: "invalide token"})
            }
            res.status(401).json({data: null, success: false, message: err.message})
        }
    }
 
}