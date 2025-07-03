import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28BFE",
    "#FF6699",
    "#8884d8",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file!");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null); // Clear previous result
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
      toast.success("Image uploaded and processed!");
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      toast.error("Error uploading file. Check backend!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-pink-100 flex flex-col">
      <ToastContainer />
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800">
          🥗 Food Nutrition Analyzer
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Upload food image to analyze its nutrients
        </p>
      </header>

      <motion.div
        className="bg-white shadow-xl rounded-2xl p-8 mx-auto w-full max-w-4xl"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {preview && (
            <div className="w-64 h-64 rounded-xl border shadow overflow-hidden bg-white flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center mt-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-blue-600 font-medium">
                Processing...
              </span>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition"
            >
              Upload
            </button>
          )}
        </div>

        {/* Nutrition Tables and Pie Charts */}
        {result?.food_detected?.length > 0 ? (
          <div className="mt-10 space-y-12">
            {result.food_detected.slice(0, 5).map((food, index) => {
              const data = result.nutrition[food]?.[0] || {};
              const nutrients = [
                { name: "Protein", value: data.protein_g || 0 },
                { name: "Carbs", value: data.carbohydrates_total_g || 0 },
                { name: "Fats", value: data.fat_total_g || 0 },
              ];

              const fullTable = [
                { name: "Calories", key: "calories", unit: "kcal" },
                { name: "Protein", key: "protein_g", unit: "g" },
                { name: "Carbohydrates", key: "carbohydrates_total_g", unit: "g" },
                { name: "Fats", key: "fat_total_g", unit: "g" },
                { name: "Sugar", key: "sugar_g", unit: "g" },
                { name: "Fiber", key: "fiber_g", unit: "g" },
                { name: "Sodium", key: "sodium_mg", unit: "mg" },
              ];

              return (
                <div key={index}>
                  <h2 className="text-xl font-semibold text-center mb-4">
                    🍽 Nutrition Info for{" "}
                    <span className="text-blue-600 font-bold">{food}</span>
                  </h2>

                  {/* Pie Chart with center label */}
                  <div className="flex justify-center mb-6">
                    <ResponsiveContainer width={300} height={300}>
                      <PieChart>
                        <Pie
                          data={nutrients}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({ cx, cy }) => (
                            <text
                              x={cx}
                              y={cy}
                              fill="black"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {data.calories ? `${data.calories} kcal` : ""}
                            </text>
                          )}
                        >
                          {nutrients.map((_, i) => (
                            <Cell
                              key={`cell-${i}`}
                              fill={COLORS[i % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full border border-gray-200 text-sm text-left shadow-md rounded-xl overflow-hidden">
                      <thead className="bg-blue-100 text-gray-800 font-medium">
                        <tr>
                          <th className="px-4 py-2">Nutrient</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {fullTable.map((n, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-2 font-medium">{n.name}</td>
                            <td className="px-4 py-2">{data[n.key] ?? "N/A"}</td>
                            <td className="px-4 py-2">{n.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !loading &&
          !result && (
            <div className="text-center text-gray-600 text-sm mt-10">
              No nutrition data yet. Please upload a food image.
            </div>
          )
        )}
      </motion.div>

      <footer className="text-center text-gray-500 text-lg py-6 mt-10">
        AI - Food Nutrition Estimator
      </footer>
    </div>
  );
}
