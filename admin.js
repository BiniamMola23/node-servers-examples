const productForm = document.getElementById("productForm");
const productsBody = document.getElementById("productsBody");
const productsTable = document.getElementById("productsTable");
const status = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");
const displaySection = document.getElementById("displaySection");

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function loadProducts() {
  status.style.display = "block";
  status.textContent = "Loading products...";
  productsTable.style.display = "none";

  try {
    const response = await fetch("/iphones");
    if (!response.ok) throw new Error("Failed to load products");

    const data = await response.json();
    const products = data.products || [];

    if (products.length === 0) {
      status.textContent = "No products found in database.";
      return;
    }

    productsBody.innerHTML = products
      .map(
        (product) => `
          <tr>
            <td>${escapeHtml(product.product_name)}</td>
            <td>${escapeHtml(product.product_url)}</td>
            <td>${escapeHtml(product.product_brief_description)}</td>
            <td>${escapeHtml(product.starting_price)}</td>
            <td>${escapeHtml(product.price_range)}</td>
          </tr>
        `
      )
      .join("");

    status.style.display = "none";
    productsTable.style.display = "table";
  } catch (error) {
    status.textContent =
      "Could not load data from database. Check server/MySQL and try again.";
  }
}

refreshBtn.addEventListener("click", loadProducts);

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(productForm);
  const submitBtn = productForm.querySelector(".submit-btn");
  const originalBtnText = submitBtn.value;
  submitBtn.value = "Saving...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("/add-product", {
      method: "POST",
      body: new URLSearchParams(formData),
    });

    if (!response.ok) throw new Error("Failed to insert product");

    await loadProducts();
    productForm.reset();
    displaySection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    alert("Could not insert product. Please check server and database.");
  } finally {
    submitBtn.value = originalBtnText;
    submitBtn.disabled = false;
  }
});

loadProducts();
