import {
  createTransactionService,
  getTransactionByIdService,
  searchTransactionsService,
  updateTransactionService,
  deleteTransactionService,
} from '../services/transactions.service.js';


export const createTransactionController = async (req, res) => {

    console.log('Controller body:', req.body);

    try {

        const transaction = req.body;

        const result = await createTransactionService(transaction);

        return res.status(201).json({

            success: true,

            data: result

        });

    } catch (error) {

        console.error(error);

        return res.status(error.status || 500).json({

            success: false,

            message: error.message || 'Failed to create transaction'

        });

    }

};
export const getTransactionByIdController = async (req, res) => {
    try{
        const { id } = req.params;
        const result = await getTransactionByIdService(id);
        if (!result) {
                     return res.status(404).json({
                     message: 'Transaction not found',
                      });
                     }
        return res.status(200).json(result);


    }
    catch (error){
          console.error(error);

            return res.status(500).json({
            message: 'Failed to find transaction',
               });

    }

};

export const searchTransactionsController = async (req, res) => {
    try{
         const filters = req.query;
         const result = await searchTransactionsService(filters);
        
         return res.status(200).json(result)


    }
    catch(error){
            console.log(error)
            return res.status(500).json({message : 'Failed to find your search',})
    }

};

export const updateTransactionController = async (req, res) => {
    try{
        const id = req.params.id;
        const data = req.body;
        
        const result = await updateTransactionService(id, data);
        if (result.changes === 0) {
                        return res.status(404).json({
                        message: 'Transaction not found',
                                                   });
                                  }

        return res.status(200).json(result)

      }
    catch(error){
             console.error(error);
            return res.status(500).json({message : 'Failed to Update data',})
      }

};

export const deleteTransactionController = async (req, res) => {
    try{ 
         const {id} = req.params;

         const result = await deleteTransactionService(id);
       if (result.changes === 0) {
    return res.status(404).json({
                                     message: 'Transaction not found'
                                });
                                }
    return res.status(200).json(result)
}
catch (error){
           console.error(error);
          return res.status(500).json({message:'Failed delete transacrion'}) 

}
    
};