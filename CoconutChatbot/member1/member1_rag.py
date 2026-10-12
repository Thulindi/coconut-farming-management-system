import os
import glob
from langchain_community.document_loaders import PDFMinerLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

DATA_DIR = "data"
DB_DIR = "coconut_db"

def build_db():
    all_docs = []

    # Load all PDF files from data/
    for pdf_file in glob.glob(os.path.join(DATA_DIR, "*.pdf")):
        print(f"Loading PDF: {pdf_file}")
        loader = PDFMinerLoader(pdf_file)
        all_docs.extend(loader.load())

    # Load all TXT files from data/
    for txt_file in glob.glob(os.path.join(DATA_DIR, "*.txt")):
        print(f"Loading TXT: {txt_file}")
        loader = TextLoader(txt_file, encoding="utf-8")
        all_docs.extend(loader.load())

    if not all_docs:
        print("Error: No PDF or TXT files found in data/ folder!")
        return

    print(f"Total documents loaded: {len(all_docs)}")

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    chunks = text_splitter.split_documents(all_docs)
    print(f"Total chunks created: {len(chunks)}")

    # Build vector database
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=DB_DIR)
    print(f"Database created at {DB_DIR} with {len(chunks)} chunks!")

if __name__ == "__main__":
    build_db()