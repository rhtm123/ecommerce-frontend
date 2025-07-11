<script>
    import { run } from 'svelte/legacy';

    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { PUBLIC_ESTORE_ID } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user } from '$lib/stores/auth';
    import { addAlert } from '$lib/stores/alert';
    import TiptapEditor from '$lib/components/wyswyg/TiptapEditor.svelte';
    import ProductForm from './ProductForm.svelte';
    import VariantManager from './VariantManager.svelte';
    import ProductListingManager from './ProductListingManager.svelte';
    import { productApi } from '$lib/services/productApi';

    let authUser;
    const unsubscribe = user.subscribe(value => authUser = value);
    onDestroy(() => unsubscribe());

    // State variables
    let step = $state(1); // 1: Add/Edit Product, 2: Add/Edit Listings
    let product = $state({
        id: null,
        name: '',
        about: '',
        description: '',
        important_info: '',
        unit_size: 1.00,
        size_unit: '',
        is_service: false,
        category_id: null,
        brand_id: null,
        tax_category_id: null,
        country_of_origin: 'India'
    });
    let productListings = $state([]);
    let currentListing = $state({
        id: null,
        product_id: null,
        name: '',
        price: '',
        mrp: '',
        stock: '',
        buy_limit: 10,
        box_items: '',
        features: [], // Changed to array for table
        approved: false,
        featured: false,
        variant_id: null,
        seller_id: null,
        packer_id: null,
        importer_id: null,
        manufacturer_id: null,
        return_exchange_policy_id: null,
        tax_category_id: null,
        estore_id: PUBLIC_ESTORE_ID,
        main_image: null
    });
    let variants = $state([]);
    let newVariant = $state({ "name": '', attributes: [] }); // Changed to array for table
    let categories = $state([]);
    let brands = $state([]);
    let entities = $state([]);
    let returnExchangePolicies = $state([]);
    let taxCategories = $state([]);
    let featureTemplates = $state([]);
    let errors = $state({});
    let isSubmitting = $state(false);
    let editorContent = $state('<p></p>');
    let editMode = $state(false);
    let productId = null;
    let isProductDropdownOpen = $state(false);
    let isInlineEditing = $state(false);
    let inlineEditProduct = {};

    // Modal state
    let showModal = $state(false);
    let modalType = $state(''); // 'product' or 'listing'
    let modalData = $state(null);
    let modalEditorContent = $state('<p></p>');

    // Feature and attribute form states
    let newFeature = $state({ feature_template_id: null, value: '' });
    let newAttribute = $state({ "name": '', "value": '', "real_value": '' });

    let pendingGalleryImages = $state([]);
    let galleryImages = $state([]);

    // Fetch initial data
    onMount(async () => {
        try {
            const [catRes, brandRes, entityRes, policyRes, taxRes, featureRes] = await Promise.all([
                myFetch(`${PUBLIC_API_URL}/product/categories/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100&entity_type=brand`),
                myFetch(`${PUBLIC_API_URL}/user/entities/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/product/return-exchange-policies/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/taxation/tax-categories/?page=1&page_size=100`),
                myFetch(`${PUBLIC_API_URL}/product/feature-templates/?page=1&page_size=100`)
            ]);
            categories = catRes.results;
            brands = brandRes.results;
            entities = entityRes.results;
            returnExchangePolicies = policyRes.results;
            taxCategories = taxRes.results;
            featureTemplates = featureRes.results;

            const urlParams = new URLSearchParams(window.location.search);
            productId = urlParams.get('product_id');
            // If edit_step=1 is present, always start at step 1 (product form)
            if (urlParams.get('edit_step') === '1') {
                step = 1;
            }
            if (productId) {
                editMode = true;
                await fetchProductData(productId);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            addAlert('Failed to load initial data.', 'error');
        }
    });

    async function fetchProductData(id) {
        try {
            const productRes = await myFetch(`${PUBLIC_API_URL}/product/products/${id}/`, 'GET', null, authUser.access_token);
            const listingRes = await myFetch(`${PUBLIC_API_URL}/product/product-listings/?product_id=${id}`, 'GET', null, authUser.access_token);
            console.log(productRes)
            console.log(listingRes)
            // Use first listing for editable fields if available
            const firstListing = listingRes.results && listingRes.results.length > 0 ? listingRes.results[0] : {};
            product = {
                ...productRes,
                category_id: firstListing.category?.id || productRes.category?.id || null,
                brand_id: firstListing.brand?.id || productRes.brand?.id || null,
                tax_category_id: firstListing.tax_category?.id || productRes.tax_category?.id || null,
                country_of_origin: productRes.country_of_origin || 'India',
                is_service: productRes.is_service || false,
                about: productRes.about || '',
                important_info: productRes.important_info || '',
            };
            editorContent = productRes.description || '<p></p>';
            productListings = listingRes.results.map(listing => ({
                ...listing,
                features: listing.features?.general || []
            }));
            variants = productRes.variants || [];
            // Only set step if it hasn't already been set by the URL (edit_step)
            if (typeof step === 'undefined' || step === null) {
            step = productListings.length > 0 ? 2 : 1;
            }
            isProductDropdownOpen = true;
        } catch (error) {
            console.error('Error fetching product data:', error);
            addAlert('Failed to load product data.', 'error');
        }
    }

    function handleEditorChange(event) {
        editorContent = event.detail;
        product.description = editorContent;
    }

    function handleModalEditorChange(event) {
        modalEditorContent = event.detail;
        modalData.description = modalEditorContent;
    }

    function validateProductForm(data) {
        errors = {};
        if (!data.name.trim()) errors.name = 'Product name is required.';
        if (!data.category_id) errors.category_id = 'Category is required.';
        if (!data.brand_id) errors.brand_id = 'Brand is required.';
        if (!data.unit_size || isNaN(data.unit_size)) errors.unit_size = 'Unit size is required and must be a number.';
        if (!data.size_unit || !data.size_unit.trim()) errors.size_unit = 'Size unit is required.';
        return Object.keys(errors).length === 0;
    }

    async function submitProduct(event) {
        event.preventDefault();
        if (!validateProductForm(product)) return;
        isSubmitting = true;
        try {
            const formData = {
                ...product,
                description: editorContent || null
            };
            const method = editMode ? 'PUT' : 'POST';
            const url = editMode ? `${PUBLIC_API_URL}/product/products/${product.id}/` : `${PUBLIC_API_URL}/product/products/`;
            const response = await myFetch(url, method, formData, authUser.access_token);
            if (response) {
                product = { ...product, ...response };
                currentListing.product_id = response.id;
                addAlert(editMode ? 'Product updated successfully!' : 'Product added successfully! Now add a listing.', 'success');
                step = 2;
                showProductForm = false;
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            addAlert('Failed to submit product: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function validateListingForm(data) {
        errors = {};
        const price = parseFloat(data.price);
        const stock = parseInt(data.stock);
        const buy_limit = parseInt(data.buy_limit);

        if (isNaN(price) || price <= 0) errors.price = 'Price must be a positive number.';
        if (isNaN(stock) || stock < 0) errors.stock = 'Stock must be a non-negative number.';
        if (isNaN(buy_limit) || buy_limit < 1) errors.buy_limit = 'Buy limit must be at least 1.';
        return Object.keys(errors).length === 0;
    }

    async function submitProductListing(event, listingArg) {
        event.preventDefault();
        const listing = listingArg || currentListing;
        if (!validateListingForm(listing)) return;
        isSubmitting = true;
        try {
            // Ensure seller_id is set before submission
            listing.seller_id = authUser?.entity?.id || listing.seller_id;
            let formData;
            let useFormData = listing.main_image instanceof File;
            if (useFormData) {
                formData = new FormData();
                for (const key in listing) {
                    if (key === 'id') continue; // Do not send 'id' in FormData
                    let value = listing[key];
                    // Skip FK fields if value is 0 or ''
                    if ([
                        'variant_id', 'manufacturer_id', 'packer_id', 'importer_id',
                        'return_exchange_policy_id', 'tax_category_id', 'estore_id'
                    ].includes(key) && (value === 0 || value === '')) {
                        continue;
                    }
                    if (value !== null && value !== undefined && value !== "") {
                        if ([
                            'variant_id', 'manufacturer_id', 'packer_id', 'importer_id',
                            'return_exchange_policy_id', 'tax_category_id', 'estore_id',
                            'product_id', 'seller_id', 'stock', 'buy_limit', 'price', 'mrp'
                        ].includes(key)) {
                            if (!isNaN(Number(value))) {
                                formData.append(key, Number(value));
                            }
                        } else if (key === 'main_image' && value instanceof File) {
                            formData.append('main_image', value);
                        } else if (key === 'features') {
                            formData.append('features', JSON.stringify({ general: value }));
                        } else {
                            formData.append(key, value);
                        }
                    }
                }
                // Debug: log FormData keys and values before submit
                for (let pair of formData.entries()) {
                    console.log('FormData before submit:', pair[0], pair[1]);
                }
            }
            // Build JSON payload, only include main_image if it is a non-empty string (URL)
            const {
                main_image, // remove from spread
                ...restListing
            } = listing;
            const jsonData = {
                ...restListing,
                product_id: parseInt(listing.product_id || product.id),
                price: listing.price ? parseFloat(listing.price) : undefined,
                mrp: listing.mrp ? parseFloat(listing.mrp) : undefined,
                stock: listing.stock ? parseInt(listing.stock) : undefined,
                buy_limit: listing.buy_limit ? parseInt(listing.buy_limit) : undefined,
                seller_id: listing.seller_id,
                estore_id: PUBLIC_ESTORE_ID,
                variant_id: listing.variant_id ? parseInt(listing.variant_id) : undefined,
                manufacturer_id: listing.manufacturer_id ? parseInt(listing.manufacturer_id) : undefined,
                packer_id: listing.packer_id ? parseInt(listing.packer_id) : undefined,
                importer_id: listing.importer_id ? parseInt(listing.importer_id) : undefined,
                return_exchange_policy_id: listing.return_exchange_policy_id ? parseInt(listing.return_exchange_policy_id) : undefined,
                tax_category_id: listing.tax_category_id ? parseInt(listing.tax_category_id) : undefined,
                features: { general: listing.features }
            };
            if (typeof main_image === 'string' && main_image.trim() !== '') {
                jsonData.main_image = main_image;
            }
            const method = listing.id ? 'PUT' : 'POST';
            const url = listing.id ? `${PUBLIC_API_URL}/product/product-listings/${listing.id}/` : `${PUBLIC_API_URL}/product/product-listings/`;
            let response;
            // Use FormData for both POST and PUT if main_image is a File
            if (useFormData) {
                response = await fetch(url, {
                    method,
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${authUser.access_token}`
                    }
                });
            } else {
                response = await fetch(url, {
                    method,
                    body: JSON.stringify(jsonData),
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authUser.access_token}`
                    }
                });
            }
            if (response.ok) {
                const data = await response.json();
                // Always upload new gallery images if any are selected
                if (pendingGalleryImages.length > 0) {
                    await uploadPendingGalleryImages(data.id);
                }
                if (listing.id) {
                    productListings = productListings.map(l => l.id === data.id ? { ...data, features: data.features?.general || [] } : l);
                    // After update, show the updated listing in the form (including new main_image)
                    currentListing = {
                        ...data,
                        features: data.features?.general || []
                    };
                } else {
                    productListings = [...productListings, { ...data, features: data.features?.general || [] }];
                resetListingForm();
                }
                addAlert('Product listing saved successfully!', 'success');
            } else {
                addAlert('Failed to submit listing', 'error');
            }
        } catch (error) {
            console.error('Error submitting listing:', error);
            addAlert('Failed to submit listing: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }


    function addFeature() {
        if (!newFeature.feature_template_id || !newFeature.value.trim()) {
            addAlert('Feature template and value are required.', 'error');
            return;
        }
        currentListing.features = [...currentListing.features, { ...newFeature }];
        newFeature = { feature_template_id: null, value: '' };
    }

    function removeFeature(index) {
        currentListing.features = currentListing.features.filter((_, i) => i !== index);
    }

    function handleAddAttribute() {
        if (!newAttribute.name.trim() || !newAttribute.value.trim()) {
            addAlert('Attribute name and value are required.', 'error');
            return;
        }
        newVariant.attributes = [...newVariant.attributes, { ...newAttribute }];
        newAttribute = { "name": '', "value": '', "real_value": '' };
    }

    function handleRemoveAttribute(event) {
        const { index } = event.detail;
        newVariant.attributes = newVariant.attributes.filter((_, i) => i !== index);
    }

    function resetListingForm() {
        currentListing = {
            id: null,
            product_id: product.id,
            name: '',
            price: '',
            mrp: '',
            stock: '',
            buy_limit: 10,
            box_items: '',
            features: [],
            approved: false,
            featured: false,
            variant_id: null,
            seller_id: authUser?.entity.id,
            packer_id: null,
            importer_id: null,
            manufacturer_id: null,
            return_exchange_policy_id: null,
            tax_category_id: null,
            estore_id: PUBLIC_ESTORE_ID,
            main_image: null
        };
    }

    function editProduct() {
        modalType = 'product';
        // Use product and first listing for modal prefill
        const firstListing = productListings && productListings.length > 0 ? productListings[0] : {};
        modalData = {
            ...product,
            category_id: firstListing.category?.id || product.category_id || null,
            brand_id: firstListing.brand?.id || product.brand_id || null,
            tax_category_id: firstListing.tax_category?.id || product.tax_category_id || null,
            country_of_origin: product.country_of_origin || 'India',
            is_service: product.is_service || false,
            about: product.about || '',
            important_info: product.important_info || '',
        };
        modalEditorContent = product.description || '<p></p>';
        showModal = true;
        // Always go to step 1 (product form) when editing product
        step = 1;
    }

    async function handleEditListing(listing) {
        if (!listing.id) return;
        // Only go to step 1 if not already on step 2 (listing step)
        if (step !== 2) {
            step = 1;
            // Optionally pre-fill product form with product info from listing
            if (listing.product) {
                product = {
                    ...product,
                    ...listing.product,
                    category_id: listing.category?.id || listing.product.category?.id || product.category_id || null,
                    brand_id: listing.product.brand?.id || product.brand_id || null,
                    tax_category_id: listing.tax_category?.id || listing.product.tax_category?.id || product.tax_category_id || null,
                    country_of_origin: listing.product.country_of_origin || product.country_of_origin || 'India',
                    is_service: listing.product.is_service || product.is_service || false,
                    about: listing.product.about || product.about || '',
                    important_info: listing.product.important_info || product.important_info || '',
                };
                editorContent = listing.product.description || '<p></p>';
            }
        }
        // After product form is confirmed, user can move to step 2 to edit the listing
        try {
            const data = await productApi.getProductListingById(listing.id);
            currentListing = {
                id: data.id,
                product_id: data.product?.id || data.product_id || null,
                name: data.name || '',
                price: data.price || '',
                mrp: data.mrp || '',
                stock: data.stock || '',
                buy_limit: data.buy_limit || 10,
                box_items: data.box_items || '',
                features: (data.features?.general || []).map(f => ({
                    feature_template_id: f.feature_template_id,
                    value: f.value
                })),
                approved: data.approved || false,
                featured: data.featured || false,
                variant_id: data.variant?.id || '',
                seller_id: data.seller?.id || '',
                packer_id: data.packer?.id || '',
                importer_id: data.importer?.id || '',
                manufacturer_id: data.manufacturer?.id || '',
                return_exchange_policy_id: data.return_exchange_policy?.id || '',
                tax_category_id: data.tax_category?.id || '',
                estore_id: data.estore_id || '',
                main_image: data.main_image || null
            };
            await fetchGalleryImages(data.id);
        } catch (error) {
            addAlert('Failed to load listing details.', 'error');
        }
    }

    function deleteListing(id) {
        if (confirm('Are you sure you want to delete this listing?')) {
            myFetch(`${PUBLIC_API_URL}/product/product-listings/${id}/`, 'DELETE', null, authUser.access_token)
                .then(() => {
                    productListings = productListings.filter(l => l.id !== id);
                    addAlert('Listing deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting listing:', error);
                    addAlert('Failed to delete listing.', 'error');
                });
        }
    }

    async function handleAddVariant() {
        if (!newVariant.name.trim()) {
            addAlert('Variant name is required.', 'error');
            return;
        }
        try {
            const payload = {
                product_id: product.id,
                name: newVariant.name,
                attributes: newVariant.attributes
            };
            const response = await fetch(`${PUBLIC_API_URL}/product/variants/`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authUser.access_token}`
                }
            });
            if (!response.ok) {
                const err = await response.text();
                throw new Error('Failed to add variant: ' + err);
            }
            const data = await response.json();
            variants = [...variants, data];
            newVariant = { name: '', attributes: [] };
            addAlert('Variant added successfully!', 'success');
        } catch (error) {
            addAlert('Failed to add variant.', 'error');
        }
    }

    async function submitModalData(event) {
        event.preventDefault();
        if (modalType === 'product') {
            if (!validateProductForm(modalData)) return;
            isSubmitting = true;
            try {
                const formData = {
                    ...modalData,
                    description: modalEditorContent || null
                };
                const response = await myFetch(`${PUBLIC_API_URL}/product/products/${modalData.id}/`, 'PUT', formData, authUser.access_token);
                if (response) {
                    product = { ...product, ...modalData, ...response };
                    addAlert('Product updated successfully!', 'success');
                    closeModal();
                }
            } catch (error) {
                console.error('Error updating product:', error);
                addAlert('Failed to update product: ' + (error.detail || error), 'error');
            } finally {
                isSubmitting = false;
            }
        } else if (modalType === 'listing') {
            if (!validateListingForm(modalData)) return;
            isSubmitting = true;
            try {
                const jsonData = {
                    ...modalData,
                    product_id: parseInt(modalData.product_id),
                    price: parseFloat(modalData.price) || 0,
                    mrp: modalData.mrp ? parseFloat(modalData.mrp) : null,
                    stock: parseInt(modalData.stock) || 0,
                    buy_limit: parseInt(modalData.buy_limit) || 10,
                    seller_id: authUser?.entity.id,
                    estore_id: PUBLIC_ESTORE_ID,
                    variant_id: modalData.variant_id ? parseInt(modalData.variant_id) : null,
                    manufacturer_id: modalData.manufacturer_id ? parseInt(modalData.manufacturer_id) : null,
                    packer_id: modalData.packer_id ? parseInt(modalData.packer_id) : null,
                    importer_id: modalData.importer_id ? parseInt(modalData.importer_id) : null,
                    return_exchange_policy_id: modalData.return_exchange_policy_id ? parseInt(modalData.return_exchange_policy_id) : null,
                    tax_category_id: modalData.tax_category_id ? parseInt(modalData.tax_category_id) : null,
                    features: { general: modalData.features }
                };
                const response = await myFetch(`${PUBLIC_API_URL}/product/product-listings/${modalData.id}/`, 'PUT', jsonData, authUser.access_token);
                if (response) {
                    productListings = productListings.map(l => l.id === response.id ? { ...response, features: response.features?.general || [] } : l);
                    addAlert('Product listing updated successfully!', 'success');
                    closeModal();
                }
            } catch (error) {
                console.error('Error updating listing:', error);
                addAlert('Failed to update listing: ' + (error.detail || error), 'error');
            } finally {
                isSubmitting = false;
            }
        }
    }

    function closeModal() {
        showModal = false;
        modalType = '';
        modalData = null;
        modalEditorContent = '<p></p>';
        errors = {};
    }

    function toggleProductDropdown() {
        isProductDropdownOpen = !isProductDropdownOpen;
    }

    function handleMainImageFileChange(event) {
        const file = event.target.files && event.target.files[0];
        if (file) {
            currentListing.main_image = file;
            // Debug log
            console.log('Selected main image file:', file);
        } else {
            currentListing.main_image = null;
        }
    }

    async function handleModalMainImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/`, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${authUser.access_token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            modalData.main_image = data.image;
        } else {
            addAlert('Failed to upload image', 'error');
        }
    }

    function handleGalleryImagesSelectEvent(event) {
        // Support both native and custom events
        let files = event?.target?.files || event?.detail?.files || [];
        pendingGalleryImages = Array.from(files);
    }

    async function uploadPendingGalleryImages(listingId) {
        for (const file of pendingGalleryImages) {
            const formData = new FormData();
            formData.append('product_listing_id', listingId);
            formData.append('image', file);
            await fetch(`${PUBLIC_API_URL}/product/product-listing-images/`, {
                method: 'POST',
                body: formData,
                headers: { Authorization: `Bearer ${authUser.access_token}` }
            });
        }
        pendingGalleryImages = [];
        await fetchGalleryImages(listingId);
    }

    async function fetchGalleryImages(listingId) {
        const res = await fetch(`${PUBLIC_API_URL}/product/product-listing-images/?product_listing_id=${listingId}`);
        if (res.ok) {
            const data = await res.json();
            galleryImages = data.results || [];
        }
    }

    async function deleteGalleryImage(imageId, listingId) {
        await fetch(`${PUBLIC_API_URL}/product/product-listing-images/${imageId}/`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authUser.access_token}` }
        });
        await fetchGalleryImages(listingId);
    }

    // Fetch gallery images when a listing is selected/created
    run(() => {
        if (currentListing.id) fetchGalleryImages(currentListing.id);
    });

    let showProductForm = step === 1;

    function handleProductFormChange(event) {
        product = event.detail.product;
    }

    async function handleProductFormSubmit(event) {
        // event.detail contains { product, editorContent }
        if (!validateProductForm(event.detail.product)) return;
        isSubmitting = true;
        try {
            const formData = {
                ...event.detail.product,
                description: event.detail.editorContent || null
            };
            const method = editMode ? 'PUT' : 'POST';
            const url = editMode ? `${PUBLIC_API_URL}/product/products/${product.id}/` : `${PUBLIC_API_URL}/product/products/`;
            const response = await myFetch(url, method, formData, authUser.access_token);
            if (response) {
                product = { ...product, ...response };
                currentListing.product_id = response.id;
                addAlert(editMode ? 'Product updated successfully!' : 'Product added successfully! Now add a listing.', 'success');
                step = 2;
                showProductForm = false;
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            addAlert('Failed to submit product: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function handleListingChange(event) {
        // Preserve main_image File if present
        const prevMainImage = currentListing.main_image;
        currentListing = event.detail.currentListing;
        if (prevMainImage instanceof File) {
            currentListing.main_image = prevMainImage;
        }
    }

    function handleAddFeature() {
        if (!newFeature.feature_template_id || !newFeature.value.trim()) {
            addAlert('Feature template and value are required.', 'error');
            return;
        }
        currentListing.features = [...currentListing.features, { ...newFeature }];
        newFeature = { feature_template_id: null, value: '' };
    }

    function handleRemoveFeature(event) {
        const { index } = event.detail;
        currentListing.features = currentListing.features.filter((_, i) => i !== index);
    }

    async function handleSubmitListing(event) {
        // Use modalListing if present, otherwise fallback to currentListing
        const listing = event?.detail?.currentListing || currentListing;
        await submitProductListing({ preventDefault: () => {} }, listing);
    }

    function handleDeleteListing(event) {
        deleteListing(event.detail.id);
    }

    function handleMainImageChange(event) {
        handleMainImageFileChange({ target: { files: [event.detail.file] } });
    }

    function handleGalleryImagesSelect(event) {
        handleGalleryImagesSelectEvent(event);
    }

    function handleDeleteGalleryImage(event) {
        deleteGalleryImage(event.detail.imageId, event.detail.listingId);
    }

    function handleResetListingForm() {
        resetListingForm();
    }

    // Update variant
    async function handleUpdateVariant(variantId, payload) {
        try {
            const updated = await productApi.updateVariant(variantId, payload, authUser?.access_token);
            variants = variants.map(v => v.id === updated.id ? updated : v);
            addAlert('Variant updated successfully!', 'success');
        } catch (error) {
            addAlert('Failed to update variant.', 'error');
        }
    }

    function startInlineEdit() {
        isInlineEditing = true;
        // Always coerce to string
        inlineEditProduct = { ...product };
        
        inlineEditProduct.description = typeof product.description === 'string' ? product.description : (product.description?.toString?.() || '');
    }

    function cancelInlineEdit() {
        isInlineEditing = false;
        inlineEditProduct = {};
    }

    async function saveInlineEdit() {
        if (!validateProductForm(inlineEditProduct)) return;
        isSubmitting = true;
        try {
            // Ensure description is a string (HTML) before sending
            let desc = inlineEditProduct.description;
            if (typeof desc !== 'string') {
                // If Tiptap emits an object, try to extract HTML string
                if (desc && typeof desc.getHTML === 'function') {
                    desc = desc.getHTML();
                } else if (desc && desc.html) {
                    desc = desc.html;
                } else {
                    desc = '';
                }
            }
            const formData = { ...inlineEditProduct, description: desc };
            const url = `${PUBLIC_API_URL}/product/products/${product.id}/`;
            const response = await myFetch(url, 'PUT', formData, authUser.access_token);
            if (response) {
                product = { ...product, ...response };
                addAlert('Product updated successfully!', 'success');
                isInlineEditing = false;
            }
        } catch (error) {
            addAlert('Failed to update product: ' + (error.detail || error), 'error');
        } finally {
            isSubmitting = false;
        }
    }

    function handleInlineInputChange(e, field) {
        inlineEditProduct[field] = e.target.value;
    }
    function handleInlineSelectChange(e, field) {
        inlineEditProduct[field] = e.target.value ? parseInt(e.target.value) : null;
    }
    function handleInlineCheckboxChange(e, field) {
        inlineEditProduct[field] = e.target.checked;
    }
    function handleInlineTiptapChange(event) {
        // event is a CustomEvent, value is in event.detail
        console.log('TiptapEditor emitted:', event, typeof event);
        inlineEditProduct.description = typeof event.detail === 'string' ? event.detail : '';
    }

    function switchTab(tab) {
        if (tab === 1) step = 1;
        else step = 2;
    }
</script>

<!-- Main Container -->
<div class="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">
                        {editMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <p class="mt-2 text-gray-600">
                        {step === 1 ? 'Create your product details' : 'Manage product listings and variants'}
                    </p>
                </div>
                
                <!-- Progress Steps as Tabs -->
                <div class="flex items-center space-x-4 mb-8">
                    <button type="button" on:click={() => switchTab(1)} class="flex items-center px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none transition-colors duration-150
                        {step === 1 ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full mr-2 {step === 1 ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}">1</span>
                        Product
                    </button>
                    <div class="w-8 h-0.5 {step === 2 ? 'bg-blue-600' : 'bg-gray-200'}"></div>
                    <button type="button" on:click={() => switchTab(2)} class="flex items-center px-4 py-2 rounded-lg font-semibold text-sm focus:outline-none transition-colors duration-150
                        {step === 2 ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full mr-2 {step === 2 ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}">2</span>
                        Listings
                    </button>
                        </div>
            </div>
        </div>


        {#if step === 1}
            <!-- Product Form -->
       
        <ProductForm
            {product}
            {categories}
            {brands}
            {taxCategories}
            {isSubmitting}
            {errors}
            on:change={handleProductFormChange}
            on:submit={handleProductFormSubmit}
        />

        {:else}
            <!-- Step 2: Listings Management -->
            <div class="space-y-8">
                <!-- Product Summary Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">{product.name}</h2>
                                <p class="text-sm text-gray-500">Product Details</p>
                </div>
                            <div class="flex items-center space-x-3">
                            {#if !isInlineEditing}
                                <button on:click={startInlineEdit} class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit
                                </button>
                            {/if}
                            </div>
                        </div>
                        <div class="px-6 py-4 bg-gray-50">
                        {#if isInlineEditing}
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                    <select class="w-full px-3 py-2 border rounded" bind:value={inlineEditProduct.category_id} on:change={e => handleInlineSelectChange(e, 'category_id')}>
                                        <option value="">Select a category</option>
                                        {#each categories as c}
                                            <option value={c.id}>{c.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Brand</label>
                                    <select class="w-full px-3 py-2 border rounded" bind:value={inlineEditProduct.brand_id} on:change={e => handleInlineSelectChange(e, 'brand_id')}>
                                        <option value="">Select a brand</option>
                                        {#each brands as b}
                                            <option value={b.id}>{b.name}</option>
                                {/each}
                            </select>
                        </div>
                        <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Country</label>
                                    <input class="w-full px-3 py-2 border rounded" type="text" bind:value={inlineEditProduct.country_of_origin} on:input={e => handleInlineInputChange(e, 'country_of_origin')} />
                        </div>
                        <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Unit Size</label>
                                    <input class="w-full px-3 py-2 border rounded" type="number" step="0.01" bind:value={inlineEditProduct.unit_size} on:input={e => handleInlineInputChange(e, 'unit_size')} />
                        </div>
                        <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Size Unit</label>
                                    <input class="w-full px-3 py-2 border rounded" type="text" bind:value={inlineEditProduct.size_unit} on:input={e => handleInlineInputChange(e, 'size_unit')} />
                        </div>
                        <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Type</label>
                                    <select class="w-full px-3 py-2 border rounded" bind:value={inlineEditProduct.is_service} on:change={e => handleInlineSelectChange(e, 'is_service')}>
                                        <option value={false}>Product</option>
                                        <option value={true}>Service</option>
                            </select>
                        </div>
                    </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">About</label>
                                    <textarea class="w-full px-3 py-2 border rounded" rows="2" bind:value={inlineEditProduct.about} on:input={e => handleInlineInputChange(e, 'about')}></textarea>
                    </div>
                    <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Tax Category</label>
                                    <select class="w-full px-3 py-2 border rounded" bind:value={inlineEditProduct.tax_category_id} on:change={e => handleInlineSelectChange(e, 'tax_category_id')}>
                                        <option value="">Select tax category</option>
                                        {#each taxCategories as t}
                                            <option value={t.id}>{t.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                            <div class="mt-4">
                                <label class="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                <div class="border rounded-lg overflow-hidden">
                                    <TiptapEditor content={typeof inlineEditProduct.description === 'string' ? inlineEditProduct.description : ''} on:change={event => handleInlineTiptapChange(event)} />
                    </div>
                </div>
                            <div class="flex space-x-3 mt-6 justify-end">
                                <button on:click={saveInlineEdit} class="inline-flex items-center px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                                            </button>
                                <button on:click={cancelInlineEdit} class="inline-flex items-center px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">Cancel</button>
                    </div>
                                            {:else}
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                                    <span class="font-medium text-gray-700">Category:</span>
                                    <span class="ml-2 text-gray-900">{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</span>
                            </div>
                            <div>
                                    <span class="font-medium text-gray-700">Brand:</span>
                                    <span class="ml-2 text-gray-900">{brands.find(b => b.id === product.brand_id)?.name || 'N/A'}</span>
                            </div>
                            <div>
                                    <span class="font-medium text-gray-700">Country:</span>
                                    <span class="ml-2 text-gray-900">{product.country_of_origin}</span>
                            </div>
                            <div>
                                    <span class="font-medium text-gray-700">Unit Size:</span>
                                    <span class="ml-2 text-gray-900">{product.unit_size}</span>
                            </div>
                            <div>
                                    <span class="font-medium text-gray-700">Size Unit:</span>
                                    <span class="ml-2 text-gray-900">{product.size_unit}</span>
                            </div>
                        <div>
                                    <span class="font-medium text-gray-700">Type:</span>
                                    <span class="ml-2 text-gray-900">{product.is_service ? 'Service' : 'Product'}</span>
                        </div>
                        </div>
                            <div class="flex">
                                {#if product.about}
                                    <div class="mt-4 flex">
                                        <span class="font-medium text-gray-700">About:</span>
                                        <p class="mt-1 text-gray-900">{product.about}</p>
                        </div>
                                {/if}
                                {#if product.tax_category}
                                    <div class="mt-4 flex">
                                        <span class="font-medium text-gray-700">Tax Category:</span>
                                        <p class="mt-1 text-gray-900">{product.tax_category.name}</p>
                            </div>
                                    {/if}
                                {#if product.description}
                                    <div class="mt-4 flex">
                                        <span class="font-medium text-gray-700">Description:</span>
                                        <p class="mt-1 text-gray-900"> {@html product.description || '<p class="text-gray-500">No description available</p>'}</p>
                                </div>
                                    {/if}
                            </div>
                                    {/if}
                            </div>
                            </div>

                <!-- Variants Section -->
                <VariantManager
                    {variants}
                    {newVariant}
                    {newAttribute}
                    {errors}
                    {isSubmitting}
                    on:addAttribute={handleAddAttribute}
                    on:removeAttribute={handleRemoveAttribute}
                    on:addVariant={handleAddVariant}
                    on:updateVariant={e => handleUpdateVariant(e.detail.variantId, e.detail.payload)}
                />

            <!-- Listings Section -->
                <ProductListingManager
                    {productListings}
                    {currentListing}
                    {variants}
                    {entities}
                    {returnExchangePolicies}
                    {taxCategories}
                    {featureTemplates}
                    {errors}
                    {isSubmitting}
                    {pendingGalleryImages}
                    {galleryImages}
                    productId={product.id}
                    on:change={handleListingChange}
                    on:submitListing={handleSubmitListing}
                    on:editListing={e => handleEditListing(e.detail.listing)}
                    on:deleteListing={handleDeleteListing}
                    on:mainImageChange={handleMainImageChange}
                    on:galleryImagesSelect={handleGalleryImagesSelectEvent}
                    on:deleteGalleryImage={e => deleteGalleryImage(e.detail.imageId, e.detail.listingId)}
                    on:resetListingForm={handleResetListingForm}
                                            />
                        </div>
                    {/if}
                </div>
</div>
