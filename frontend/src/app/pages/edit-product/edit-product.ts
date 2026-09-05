import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';
import { ProductApiResponse, ProductRecord, ProductSource, ProductUpdatePayload, normalizeProduct } from '../../models/product.model';
import { LocalProductesService } from '../../shared/local-product/local-productes.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';
import { ProductsService } from '../../shared/cloud-product/products.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SvgIconComponent],
  templateUrl: './edit-product.html',
  styleUrls: [ './edit-product.css'],
})
export class EditProductComponent implements OnInit {
  successMessage = '';
  errorMessage = '';
  private readonly layout = inject(DashboardLayoutService);
  private readonly productsService = inject(ProductsService);
  private readonly localProductesService = inject(LocalProductesService);
  private readonly fb = inject(FormBuilder);
  private readonly ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  
  activeSource: ProductSource = 'local';
  
  // ✅ CHANGED: products from array to Signal
  products = signal<ProductRecord[]>([]);
  
  editingProduct: ProductRecord | null = null;
  
  private readonly backendBases: Record<ProductSource, string> = {
    cloud: 'http://localhost:3000',
    local: 'http://localhost:5000',
  };

  readonly editForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [null as number | null, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    sizesText: [''],
    active: [true],
  });

  ngOnInit(): void {
    this.layout.setPageTitle('Edit Product');
    this.loadProducts();
    // ✅ REMOVED: this.cdr.detectChanges();
  }

  get activeSourceLabel(): string {
    return this.activeSource === 'cloud' ? 'Cloud Products' : 'Local Products';
  }

  setSource(source: ProductSource): void {
    if (this.activeSource === source) {
      return;
      // ✅ REMOVED: this.cdr.detectChanges();
    }

    this.activeSource = source;
    this.cancelEdit();
    this.loadProducts();
  }

  private loadProducts(): void {
    const request$ =
      this.activeSource === 'cloud'
        ? this.productsService.getProducts()
        : this.localProductesService.getProducts();

    request$.subscribe({
      next: (products) => {
        if (!Array.isArray(products)) {
          console.error('Invalid products format:', products);
          // ✅ CHANGED: using Signal set
          this.ngZone.run(() => {
            this.products.set([]);
          });
          return;
        }

        // ✅ CHANGED: using Signal set with normalize
        this.ngZone.run(() => {
          this.products.set(
            products.map((product) => normalizeProduct(product as ProductApiResponse))
          );
        });
      },
      error: (err) => {
        console.error('Error loading products:', err);
        // ✅ CHANGED: using Signal set
        this.ngZone.run(() => {
          this.products.set([]);
        });
        this.errorMessage = `Failed to load ${this.activeSourceLabel.toLowerCase()}.`;
      },
    });
  }

  startEdit(product: ProductRecord): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.editingProduct = product;
    this.editForm.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      sizesText: product.sizes.join(', '),
      active: product.active,
    });
  }

  cancelEdit(): void {
    this.resetEditState();
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveEdit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.editingProduct) {
      console.error('No product selected for editing.');
      return;
    }

    if (this.editForm.invalid) {
      const invalidControls = Object.entries(this.editForm.controls)
        .filter(([, control]) => control.invalid)
        .map(([name, control]) => ({
          name,
          errors: control.errors,
          value: control.value,
        }));

      console.error('Edit form is invalid:', invalidControls);
      this.errorMessage = 'Please correct the highlighted fields before saving.';
      this.editForm.markAllAsTouched();
      return;
    }

    const rawValue = this.editForm.getRawValue();
    console.log('Raw form value:', rawValue);
    if (rawValue.price === null || rawValue.stock === null) {
      console.error('Price and stock must be provided.');
      return;
    }

    const sizes = (rawValue.sizesText ?? '')
      .split(',')
      .map((size) => size.trim())
      .filter((size) => size !== '');

    const payload: ProductUpdatePayload = {
      title: rawValue.title?.trim() ?? '',
      description: rawValue.description?.trim() ?? '',
      price: Number(rawValue.price),
      stock: Number(rawValue.stock),
      imageUrl: rawValue.imageUrl?.trim() ?? '',
      sizes,
      active: rawValue.active ?? true,
    };
    
    console.log('Prepared payload:', payload);
    
    const productId = this.editingProduct.id.trim();
    if (!productId) {
      console.error('Editing product is missing an id:', this.editingProduct);
      this.errorMessage = 'Selected product is missing an id.';
      return;
    }

    const request$ =
      this.activeSource === 'cloud'
        ? this.productsService.updateProduct(productId, payload)
        : this.localProductesService.updateProduct(productId, payload);
    
    console.log('request$', request$);
    
    request$.subscribe({
      next: () => {
        this.resetEditState();
        this.successMessage = 'Product updated successfully!';
        setTimeout(() => {
                 this.successMessage = '';
                this.cdr.markForCheck();
                        }, 3000);
        this.loadProducts();

      },
      error: (error) => {
        console.error('Error updating product:', error);
         setTimeout(() => {
                         this.errorMessage = '';
                         this.cdr.markForCheck();
                          }, 3000);
        this.errorMessage = error?.error?.message ?? 'Failed to update product';
         setTimeout(() => {
                         this.errorMessage = '';
                         this.cdr.markForCheck();
                          }, 3000);
      },
    });
  }

  private resetEditState(): void {
    this.editingProduct = null;
    this.editForm.reset({
      title: '',
      description: '',
      price: null,
      stock: null,
      imageUrl: '',
      sizesText: '',
      active: true,
    });
  }

  trackByProduct(_: number, product: ProductRecord): string {
    return product.id || product._id || String(_);
  }

  resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('assets/') || url.startsWith('/assets/')) return url;
    const backendBase = this.backendBases[this.activeSource];
    return `${backendBase}${url.startsWith('/') ? url : `/${url}`}`;
  }
}