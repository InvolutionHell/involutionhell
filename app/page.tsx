import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Community } from "./components/Community";
import { Footer } from "./components/Footer";
import { neon } from "@neondatabase/serverless";

export function Page() {
  async function create(formData: FormData) {
    "use server";
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get("comment");
    // Insert the comment from the form into the Postgres database
    await sql`INSERT INTO comments (comment) VALUES (${comment})`;
  }

  return (
    <form action={create} className="flex flex-col gap-2 mt-72">
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default function DocsIndex() {
  return (
    <>
      <Page />
      <Header />
      <Hero />
      <Features />
      <Community />
      <Footer />
    </>
  );
}
