package factory;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConn {
	static Connection con;

	// to write JDBC program
	// i) Load the JDBC driver
	// ii) Establish connection to DB
	// iii) Create a Statement object
	// iv) Execute SQL command using stmt.executeUpdate(sql)
	// v) display the result
	// vi) close the stmt and con objects
	public static Connection getConn() {

		try {
			/*
			 * Class.forName("oracle.jdbc.driver.OracleDriver"); con =
			 * DriverManager.getConnection( "jdbc:oracle:thin:@localhost:1521:XE", "lms",
			 * "lms");
			 */
			Class.forName("com.mysql.jdbc.Driver");
			con = DriverManager.getConnection(
					"jdbc:mysql://localhost:3306/lms", "root", "ankuN@123987#");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return con;
	}

	public static void main(String rags[]) {
		Connection con = getConn();
		System.out.println(con);
	}
}
