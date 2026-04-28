export type Role = "ADMIN" | "USER";

export interface Book {
  id: number;
  title: string;
  author: string;
  cover_image_url: string | null;
  price: number;
}

export interface Sale {
  id: number;
  book_id: number;
  quantity: number;
  sale_date: string;
  book: Book;
}

export interface User {
  id: number;
  username: string;
  role: Role;
}

export interface BookFormData {
  title: string;
  author: string;
  price: number;
  cover_image_url: string;
}

export interface UserFormData {
  username: string;
  password: string;
  role: Role;
}

export interface CartItem {
  book: Book;
  quantity: number;
}
