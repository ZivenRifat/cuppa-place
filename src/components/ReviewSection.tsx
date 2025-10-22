"use client";

export default function ReviewSection() {
  return (
    <section className="mb-16">
      <h2 className="font-semibold text-lg mb-2">Reviews</h2>
      <div className="flex gap-2">
        <textarea
          placeholder="Write a review..."
          className="border border-gray-300 rounded-lg p-2 w-full h-[100px] resize-none"
        />
        <button className="bg-[#2b210a] text-white px-4 rounded-lg hover:opacity-90">
          📍
        </button>
      </div>
    </section>
  );
}
