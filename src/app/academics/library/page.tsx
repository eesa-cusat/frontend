"use client";

import React, { useState, useEffect } from "react";
import { Book, Search } from "lucide-react";

interface LibraryBook {
  id: number;
  title: string;
  author: string;
  isbn: string;
  available_copies: number;
  total_copies: number;
  category: string;
  publication_year: number;
  description: string;
}

const LibraryPage = () => {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    "programming",
    "mathematics",
    "physics",
    "chemistry",
    "electronics",
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      // For now, using dummy data since the API endpoint needs to be created
      const dummyBooks: LibraryBook[] = [
        {
          id: 1,
          title: "Introduction to Algorithms",
          author: "Thomas H. Cormen",
          isbn: "978-0262033848",
          available_copies: 3,
          total_copies: 5,
          category: "programming",
          publication_year: 2009,
          description:
            "Comprehensive introduction to algorithms and data structures",
        },
        {
          id: 2,
          title: "Calculus: Early Transcendentals",
          author: "James Stewart",
          isbn: "978-1285741550",
          available_copies: 2,
          total_copies: 4,
          category: "mathematics",
          publication_year: 2015,
          description: "Complete calculus textbook for engineering students",
        },
      ];
      setBooks(dummyBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading library books...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Digital Library
          </h1>
          <p className="text-gray-600">
            Browse and search through our collection of academic books and
            resources.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all"
                      ? "All Categories"
                      : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Book className="w-8 h-8 text-blue-600" />
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      book.available_copies > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.available_copies > 0 ? "Available" : "Out of Stock"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 mb-2">by {book.author}</p>
                <p className="text-sm text-gray-500 mb-3">{book.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>ISBN:</span>
                    <span>{book.isbn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available:</span>
                    <span>
                      {book.available_copies}/{book.total_copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="capitalize">{book.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Published:</span>
                    <span>{book.publication_year}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      book.available_copies > 0
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={book.available_copies === 0}
                  >
                    {book.available_copies > 0
                      ? "Request Book"
                      : "Out of Stock"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-8">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No books found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
