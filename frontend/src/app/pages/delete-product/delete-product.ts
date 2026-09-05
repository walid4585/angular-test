import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ProductApiResponse, ProductRecord, ProductSource, normalizeProduct } from '../../models/product.model';
import { LocalProductesService } from '../../shared/local-product/local-productes.service';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';
import { ProductsService } from '../../shared/cloud-product/products.service';

@Component({
  selector: 'app-delete-product',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './delete-product.html',
  styleUrls: [ './delete-product.css'],
})
export class DeleteProductComponent implements OnInit {
getOrderCountForProduct() {
throw new Error('Method not implemented.');
}
  successMessage =  signal<string>('');
  errorMessage = signal<string>('');
  activeSource: ProductSource = 'local';
  
  // ✅ Signal for products
  products = signal<ProductRecord[]>([]);
  
  // ✅ Signal for modal state
  archiveProductId = signal<string | null>(null);
  productToArchive = signal<ProductRecord | null>(null);

  private readonly layout = inject(DashboardLayoutService);
  private readonly productsService = inject(ProductsService);
  private readonly localProductesService = inject(LocalProductesService);

  private readonly backendBases: Record<ProductSource, string> = {
    cloud: 'http://localhost:3000',
    local: 'http://localhost:5000',
  };

  // ✅ Computed signal for product to archive
  productToArchiveValue = computed(() => {
    const id = this.archiveProductId();
    if (!id) return null;
    return this.products().find(p => p.id === id || p._id === id) || null;
  });

  ngOnInit(): void {
    this.layout.setPageTitle('Delete Product');
    this.loadProducts();
  }

  get activeSourceLabel(): string {
    return this.activeSource === 'cloud' ? 'Cloud Products' : 'Local Products';
  }

  setSource(source: ProductSource): void {
    if (this.activeSource === source) {
      return;
    }

    this.activeSource = source;
    this.successMessage.set('');
    this.errorMessage.set('');
    this.archiveProductId.set(null);
    this.productToArchive.set(null);
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
          this.products.set([]);
          return;
        }

        this.products.set(
          products.map((product) => normalizeProduct(product as ProductApiResponse))
        );
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.products.set([]);
        this.errorMessage.set(`Failed to load ${this.activeSourceLabel.toLowerCase()}.`);
        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      },
    });
  }

  trackByProduct(_: number, product: ProductRecord): string {
    return product.id || product._id || String(_);
  }

  // ====== DELETE Product ======
  deleteProduct(productId: string): void {
    if (!productId) {
      console.error('Invalid product ID:', productId);
      return;
    }

    this.successMessage.set('');
    this.errorMessage.set('');
    this.archiveProductId.set(null);
    this.productToArchive.set(null);

    const request$ =
      this.activeSource === 'cloud'
        ? this.productsService.deleteProduct(productId)
        : this.localProductesService.deleteProduct(productId);

    request$.subscribe({
      next: () => {
        console.log('Product deleted successfully:', productId);
        this.loadProducts();
        this.successMessage.set('✅ Product deleted successfully!');

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (err) => {
        console.error('Error deleting product:', err);

        // ✅ Show archive modal on 409 Conflict
        if (err.status === 409) {
          this.archiveProductId.set(productId);
          this.productToArchive.set(this.productToArchiveValue());
          this.errorMessage.set(''); // Hide error, show modal instead
        } else if (err.status === 404) {
          this.errorMessage.set(' Product not found. It may have been already deleted.');
          setTimeout(() => {
            this.errorMessage.set('');
          }, 5000);
        } else if (err.status === 0) {
          this.errorMessage.set(' Network error. Please check your connection.');
          setTimeout(() => {
            this.errorMessage.set('');
          }, 5000);
        } else {
          this.errorMessage.set(err?.error?.message || ' Failed to delete product');
          setTimeout(() => {
            this.errorMessage.set('');
          }, 5000);
        }

        setTimeout(() => {
          if (!this.archiveProductId()) {
            this.errorMessage.set('');
          }
        }, 5000);
      },
    });
  }

  // ====== ARCHIVE Product ======
  archiveProduct(productId: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const request$ =
      this.activeSource === 'cloud'
        ? this.productsService.archiveProduct?.(productId) 
        : this.localProductesService.archiveProduct(productId);

    request$.subscribe({
      next: () => {
        this.archiveProductId.set(null);
        this.productToArchive.set(null);
        this.successMessage.set('✅ Product archived successfully!');
        this.loadProducts();

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (err) => {
        console.error('Error archiving product:', err);
        this.errorMessage.set('❌ Failed to archive product: ' + (err?.error?.message || 'Unknown error'));

        setTimeout(() => {
          this.errorMessage.set('');
        }, 5000);
      },
    });
  }

  // ====== CANCEL Archive ======
  cancelArchive(): void {
    this.archiveProductId.set(null);
    this.productToArchive.set(null);
    this.errorMessage.set(' Archive cancelled. Product remains active.');
    
    setTimeout(() => {
      this.errorMessage.set('');
    }, 3000);
  }

  resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('assets/') || url.startsWith('/assets/')) return url;
    const backendBase = this.backendBases[this.activeSource];
    return `${backendBase}${url.startsWith('/') ? url : `/${url}`}`;
  }
}