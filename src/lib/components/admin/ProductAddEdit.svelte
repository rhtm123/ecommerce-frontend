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
        if (!data.price || data.price <= 0) errors.price = 'Price must be a positive number.';
        if (!data.stock || data.stock < 0) errors.stock = 'Stock must be a non-negative number.';
        if (!data.buy_limit || data.buy_limit < 1) errors.buy_limit = 'Buy limit must be at least 1.';
        return Object.keys(errors).length === 0;
    }

    async function submitProductListing(event) {
        event.preventDefault();
        if (!validateListingForm(currentListing)) return;
        isSubmitting = true;
        try {
            // Ensure seller_id is set before submission
            currentListing.seller_id = authUser?.entity?.id || currentListing.seller_id;
            let formData;
            let useFormData = currentListing.main_image instanceof File;
            if (useFormData) {
                formData = new FormData();
                for (const key in currentListing) {
                    if (key === 'id') continue; // Do not send 'id' in FormData
                    let value = currentListing[key];
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
            } = currentListing;
            const jsonData = {
                ...restListing,
                product_id: parseInt(currentListing.product_id || product.id),
                price: currentListing.price ? parseFloat(currentListing.price) : undefined,
                mrp: currentListing.mrp ? parseFloat(currentListing.mrp) : undefined,
                stock: currentListing.stock ? parseInt(currentListing.stock) : undefined,
                buy_limit: currentListing.buy_limit ? parseInt(currentListing.buy_limit) : undefined,
                seller_id: currentListing.seller_id,
                estore_id: PUBLIC_ESTORE_ID,
                variant_id: currentListing.variant_id ? parseInt(currentListing.variant_id) : undefined,
                manufacturer_id: currentListing.manufacturer_id ? parseInt(currentListing.manufacturer_id) : undefined,
                packer_id: currentListing.packer_id ? parseInt(currentListing.packer_id) : undefined,
                importer_id: currentListing.importer_id ? parseInt(currentListing.importer_id) : undefined,
                return_exchange_policy_id: currentListing.return_exchange_policy_id ? parseInt(currentListing.return_exchange_policy_id) : undefined,
                tax_category_id: currentListing.tax_category_id ? parseInt(currentListing.tax_category_id) : undefined,
                features: { general: currentListing.features }
            };
            if (typeof main_image === 'string' && main_image.trim() !== '') {
                jsonData.main_image = main_image;
            }
            const method = currentListing.id ? 'PUT' : 'POST';
            const url = currentListing.id ? `${PUBLIC_API_URL}/product/product-listings/${currentListing.id}/` : `${PUBLIC_API_URL}/product/product-listings/`;
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
                if (currentListing.id) {
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

    async function handleSubmitListing() {
        // Use the existing submitProductListing logic here
        await submitProductListing({ preventDefault: () => {} });
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
                
                <!-- Progress Steps -->
                <div class="hidden sm:flex items-center space-x-4">
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold text-sm">
                            1
                        </div>
                        <span class="ml-2 text-sm font-medium {step >= 1 ? 'text-blue-600' : 'text-gray-500'}">Product</span>
                    </div>
                    <div class="w-8 h-0.5 {step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}"></div>
                    <div class="flex items-center">
                        <div class="flex items-center justify-center w-8 h-8 rounded-full {step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} font-semibold text-sm">
                            2
                        </div>
                        <span class="ml-2 text-sm font-medium {step >= 2 ? 'text-blue-600' : 'text-gray-500'}">Listings</span>
                    </div>
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
                    <div class="px-6 py-4 border-b border-gray-200 cursor-pointer" onclick={toggleProductDropdown}>
                        <div class="flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-gray-900">{product.name}</h2>
                                <p class="text-sm text-gray-500">Product Details</p>
                </div>
                            <div class="flex items-center space-x-3">
                                <button 
                                    onclick={editProduct}
                                    class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                    Edit
                                </button>
                                <svg class="w-5 h-5 text-gray-400 transform transition-transform {isProductDropdownOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                {#if isProductDropdownOpen}
                        <div class="px-6 py-4 bg-gray-50">
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
                    </div>
                {/if}
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
