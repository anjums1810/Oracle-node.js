const express = require('express');
const employeeController = require('../Controller/employeeController'); 

const router = express.Router();

router.post('/add/employees', employeeController.addEmployee);                    
router.get('/get/employees', employeeController.getEmployee);
router.put('/salary/employees', employeeController.updateEmployeeSalary);   
router.delete('/delete/employees', employeeController.deleteEmployee);  

module.exports = router;