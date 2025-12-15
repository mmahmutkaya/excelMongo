/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('rapor724_v2');

// Create a new index in the collection.
db.getCollection('ispaketler')
  .createIndex(
   {
      _projeId: 1,
      versiyon: 1,
      // add more fields if needed
   },
   { unique: true }
  );
