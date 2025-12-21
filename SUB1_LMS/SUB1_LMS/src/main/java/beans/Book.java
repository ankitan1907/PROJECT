// Book.java
package beans;

import java.util.Objects;

public class Book {
	private String isbn;
	private String bookName;
	private String author;
	private double price;
	private String publisher;
	private int publishingYear;
	private int qtyAvailable;
	public Book() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Book(String isbn, String bookName, String author, double price, String publisher, int publishingYear,
			int qtyAvailable) {
		super();
		this.isbn = isbn;
		this.bookName = bookName;
		this.author = author;
		this.price = price;
		this.publisher = publisher;
		this.publishingYear = publishingYear;
		this.qtyAvailable = qtyAvailable;
	}
	public String getIsbn() {
		return isbn;
	}
	public void setIsbn(String isbn) {
		this.isbn = isbn;
	}
	public String getBookName() {
		return bookName;
	}
	public void setBookName(String bookName) {
		this.bookName = bookName;
	}
	public String getAuthor() {
		return author;
	}
	public void setAuthor(String author) {
		this.author = author;
	}
	public double getPrice() {
		return price;
	}
	public void setPrice(double price) {
		this.price = price;
	}
	public String getPublisher() {
		return publisher;
	}
	public void setPublisher(String publisher) {
		this.publisher = publisher;
	}
	public int getPublishingYear() {
		return publishingYear;
	}
	public void setPublishingYear(int publishingYear) {
		this.publishingYear = publishingYear;
	}
	public int getQtyAvailable() {
		return qtyAvailable;
	}
	public void setQtyAvailable(int qtyAvailable) {
		this.qtyAvailable = qtyAvailable;
	}
	@Override
	public String toString() {
		return "Book [isbn=" + isbn + ", bookName=" + bookName + ", author=" + author + ", price=" + price
				+ ", publisher=" + publisher + ", publishingYear=" + publishingYear + ", qtyAvailable=" + qtyAvailable
				+ "]";
	}
	@Override
	public int hashCode() {
		return Objects.hash(author, bookName, isbn, price, publisher, publishingYear, qtyAvailable);
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Book other = (Book) obj;
		return Objects.equals(author, other.author) && Objects.equals(bookName, other.bookName)
				&& Objects.equals(isbn, other.isbn)
				&& Double.doubleToLongBits(price) == Double.doubleToLongBits(other.price)
				&& Objects.equals(publisher, other.publisher) && publishingYear == other.publishingYear
				&& Objects.equals(qtyAvailable, other.qtyAvailable);
	}
}
