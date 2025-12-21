// Register.java
package beans;
/*
create table register (
	regId INT,
	name VARCHAR(20),
	email VARCHAR(50),
	pass VARCHAR(20),
	mobile BIGINT,
	address VARCHAR(50),
	roleName ENUM ('Admin','Student') NOT NULL,
	CONSTRAINT register_regId_pk PRIMARY KEY(regId)
);


create table book (
	isbn VARCHAR(10),
	bookName VARCHAR(20),
	author VARCHAR(20),
	price DOUBLE,
	publisher VARCHAR(20),
	publishingYear INT,
	qtyAvailable INT,
	CONSTRAINT book_isbn_PK PRIMARY KEY(isbn)	
);

create table bookIssued (
	issueId INT,
	isbn VARCHAR(10),
	bookName  VARCHAR(20),
	regId INT,
	name VARCHAR(20),
	reserveDate DATE,
	issueDate DATE,
	renewalDate DATE,
	returnedDate DATE,
	status ENUM('RESERVED','ISSUED','RENEWALED','RETURNED') NOT NULL,
	CONSTRAINT bookIssued_issueId_pk PRIMARY KEY(issueId),
	CONSTRAINT bookIssued_isbn_fk FOREIGN KEY(isbn) REFERENCES book(isbn),
	CONSTRAINT bookIssued_regId_fk FOREIGN KEY(regId) REFERENCES register(regId)
);

*/
public class Register {
	private int regId;
	private String name;
	private String email;
	private String pass;
	private long mobile;
	private String address;
	private String roleName;

	// no parameter constructor
	// Right click on code editor-> Source-> Generate Constructors from super class
	public Register() {
		super();
	}

	// generate parameterized constructor
	// Generate Constructor using fields
	public Register(int regId, String name, String email, String pass, long mobile, String address, String roleName) {
		super();
		this.regId = regId;
		this.name = name;
		this.email = email;
		this.pass = pass;
		this.mobile = mobile;
		this.address = address;
		this.roleName = roleName;
	}

	// generate pair of setter and getter methods
	// Generate Getters and Setters
	public int getRegId() {
		return regId;
	}

	public void setRegId(int regId) {
		this.regId = regId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

	public long getMobile() {
		return mobile;
	}

	public void setMobile(long mobile) {
		this.mobile = mobile;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getRoleName() {
		return roleName;
	}

	public void setRoleName(String roleName) {
		this.roleName = roleName;
	}

	public String toString() {
		return regId + " " + name + " " + email + " " 
				+ pass + " " + mobile + " " + address 
				+ " " + roleName;
	}

	public int hashCode() {
		return this.toString().hashCode();
	}

	public boolean equals(Object o) {
		boolean flag=false;
		if(o instanceof Register) {
			Register reg=(Register)o;
			if(this.regId==reg.getRegId() && this.name.equals(reg.getName()) 
					&& this.email.equals(reg.getEmail()) 
					&& this.pass.equals(reg.getPass()) 
					&& this.mobile==reg.getMobile() 
					&& this.address.equals(reg.getAddress()) 
					&& this.roleName.equals(reg.getRoleName())) {
				flag=true;
			}
		}
		return flag;
	}
}
