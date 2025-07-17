const oracledb = require('oracledb');
const { getConnection } = require('../db'); // Adjust path as needed

// Add Employee Function
exports.addEmployee = async function(req, res) {
  let connection;
  
  try {
    // req.body=JSON.parse(req.body);
    const { emp_id, emp_name, salary } = req.body;
    
    // Validate required fields
    if (!emp_id || !emp_name || !salary) {
      return res.json({
        success: false,
        error: 'Missing required fields: emp_id, emp_name, salary'
      });
    }
    
    // Validate data types
    if (typeof emp_id !== 'number' || typeof salary !== 'number') {
      return res.json({
        success: false,
        error: 'emp_id and salary must be numbers'
      });
    }
    
    // Get database connection
    connection = await getConnection();
    
    // Call the stored procedure
    await connection.execute(
      `BEGIN 
         DEMO.employee_pkg.add_employee(:p_id, :p_name, :p_salary); 
       END;`,
      {
        p_id: emp_id,
        p_name: emp_name,
        p_salary: salary
      },
      {
        autoCommit: true
      }
    );
    
    res.json({
      success: true,
      message: 'Employee added successfully',
      data: {
        emp_id: emp_id,
        emp_name: emp_name,
        salary: salary
      }
    });
    
  } catch (error) {
    console.error('Error adding employee:', error);
    
    let errorMessage = 'Failed to add employee';
    
    if (error.errorNum) {
      switch (error.errorNum) {
        case 1: // ORA-00001: unique constraint violated
          errorMessage = 'Employee ID already exists';
          break;
        case 1400: // ORA-01400: cannot insert NULL
          errorMessage = 'Required field cannot be null';
          break;
        case 12899: // ORA-12899: value too large for column
          errorMessage = 'Data too large for column';
          break;
        default:
          errorMessage = `Database error: ${error.message}`;
      }
    }
    
    res.json({
      success: false,
      error: errorMessage,
      details: error.message
    });
    
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// Get Employee Function
exports.getEmployee = async function(req, res) {
  let connection;
  
  try {
    const { emp_id } = req.body; 
    
    if (!emp_id) {
      return res.json({ 
        success: false,
        error: 'Employee ID is required in the request body'
      });
    }
    
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT emp_id, emp_name, salary 
       FROM DEMO.employees 
       WHERE emp_id = :p_id`,
      {
        p_id: parseInt(emp_id)
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );
    
    if (result.rows.length === 0) {
      return res.json({ // Added proper HTTP status code
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee retrieved successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error getting employee:', error);
    
    res.json({ // Added proper HTTP status code
      success: false,
      error: 'Failed to get employee',
      details: error.message
    });
    
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
};

// Update Employee Salary Function
exports.updateEmployeeSalary = async function(req, res) {
  let connection;
  
  try {
    const { emp_id, salary } = req.body;
    
    if (!emp_id || !salary) {
      return res.json({
        success: false,
        error: 'Missing required fields: emp_id, salary'
      });
    }
    
    if (typeof emp_id !== 'number' || typeof salary !== 'number') {
      return res.json({
        success: false,
        error: 'emp_id and salary must be numbers'
      });
    }
    
    connection = await getConnection();
    
    // Call the stored procedure
    await connection.execute(
      `BEGIN 
         DEMO.employee_pkg.update_salary(:p_id, :p_salary); 
       END;`,
      {
        p_id: emp_id,
        p_salary: salary
      },
      {
        autoCommit: true
      }
    );
    
    // Check if employee exists by querying after update
    const result = await connection.execute(
      `SELECT emp_id, emp_name, salary 
       FROM DEMO.employees 
       WHERE emp_id = :p_id`,
      {
        p_id: emp_id
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );
    
    if (result.rows.length === 0) {
      return res.json({
        success: false,
        error: 'Employee not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Employee salary updated successfully',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error updating employee salary:', error);
    
    res.json({
      success: false,
      error: 'Failed to update employee salary',
      details: error.message
    });
    
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

// Delete Employee Function
exports.deleteEmployee = async function(req, res) {
  let connection;
  
  try {
    const { emp_id } = req.body; 
    
    if (!emp_id) {
      return res.json({ 
        success: false,
        error: 'Employee ID is required in the request body'
      });
    }
    
    connection = await getConnection();
    
    // First check if employee exists
    const checkResult = await connection.execute(
      `SELECT emp_id, emp_name, salary 
       FROM DEMO.employees 
       WHERE emp_id = :p_id`,
      {
        p_id: parseInt(emp_id)
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      }
    );
    
    if (checkResult.rows.length === 0) {
      return res.json({ 
        success: false,
        error: 'Employee not found'
      });
    }
    
    const employeeData = checkResult.rows[0];
    
    // Call the stored procedure
    await connection.execute(
      `BEGIN 
         DEMO.employee_pkg.delete_employee(:p_id); 
       END;`,
      {
        p_id: parseInt(emp_id)
      },
      {
        autoCommit: true
      }
    );
    
    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: employeeData
    });
    
  } catch (error) {
    console.error('Error deleting employee:', error);
    
    res.json({ // Added proper HTTP status code
      success: false,
      error: 'Failed to delete employee',
      details: error.message
    });
    
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
};