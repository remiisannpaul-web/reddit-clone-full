"use client";

import { useId } from "react";
import { useState } from "react";
import { createCommunity } from "@/app/actions/communities";

export default function CreateCommunity() {
  const nameId = useId();
  const descriptionId = useId();
  const bannerUrlId = useId();
  const iconUrlId = useId();
  
  const [formData, setFormData] = useState({name: '', description: '', banner_url: '', icon_url: ''})

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update state using the spread operator to keep previous values
    setFormData({ ...formData, [name]: value });
  };

 // const handleSubmit = (e) => {
   // e.preventDefault();
    //console.log('Form Submitted:', formData);
    // Logic to send data to a server goes here
  //};

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md border">
        <h2 className="text-2xl font-bold mb-8 text-center text-primary">
          Create Community
        </h2>

        <form className="flex flex-col gap-4" action={createCommunity}>
          <div>
            <label htmlFor={nameId} className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id={nameId}
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              placeholder="e.g. Web Development"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor={descriptionId} className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id={descriptionId}
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              placeholder="Write a short description about your community"
              onChange={handleChange}
              required

            />
          </div>

          <div>
            <label htmlFor={bannerUrlId} className="block text-sm font-medium mb-1">
              Banner URL
            </label>
            <input
              type="url"
              id={bannerUrlId}
              name="banner_url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              placeholder="https://example.com/banner.jpg"
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor={iconUrlId} className="block text-sm font-medium mb-1">
              Icon URL
            </label>
            <input
              type="url"
              id={iconUrlId}
              name="icon_url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
              placeholder="https://example.com/icon.png"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full flex justify-center items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors font-semibold"
          >
            Create Community
          </button>
        </form>
      </div>
    </div>
  );
}