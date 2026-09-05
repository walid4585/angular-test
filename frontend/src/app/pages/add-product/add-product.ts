import { CommonModule } from '@angular/common';
import { ChangeDetectorRef,Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardLayoutService } from '../../layout/dashboard-layout.service';
import { ProductsService } from '../../shared/cloud-product/products.service';
import { SvgIconComponent } from '../../shared/svg-icon/svg-icon';
import { LocalProductesService } from '../../shared/local-product/local-productes.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css'],
})
export class AddProductComponent implements OnInit {
  successMessage = '';
  errorMessage = '';
  selectedImageFile: File | null = null;
  selectedImageName = '';
  activeMode: 'cloud' | 'local' = 'cloud';
  @ViewChild('imageInput') private imageInput?: ElementRef<HTMLInputElement>;

  private readonly layout = inject(DashboardLayoutService);
  private readonly productsService = inject(ProductsService);
  private readonly fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);


  readonly productForm = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    stock: [null as number | null, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    sizesText: [''],
    active: [true],
  });
  constructor(private localProductesService: LocalProductesService) {}

// ngOnInit is a lifecycle hook that is called after the component has been initialized. In this method, we set the page title to "Add Product" using the DashboardLayoutService, which likely updates the layout of the dashboard to reflect the current page.
  ngOnInit(): void {
    this.layout.setPageTitle('Add Product');
  }
  // setMode is called when the user clicks on one of the mode toggle buttons. It updates the activeMode property, which can be used to conditionally render different UI elements or trigger different logic based on the selected mode.
  setMode(mode: 'local'| 'cloud'): void {
    this.activeMode = mode;
  }
  // resetForm is called after successfully saving a product, whether to the cloud or locally. It clears the form fields and resets the image selection.
   resetForm(): void {
  this.productForm.reset({
    title: '',
    sizesText: '',
    price: null,
    stock: null,
    description: '',
  });

  this.clearSelectedImage();
}
// onSizesChange is called when the user changes the selection in the sizes dropdown. It updates the sizes form control with the selected values, ensuring that the form's state reflects the user's choices.
onSizesChange(event: Event): void {
  const select = event.target as HTMLSelectElement;

  const selectedValues = Array.from(select.selectedOptions).map(
    option => option.value
  );

  this.productForm.get('sizesText')?.setValue(selectedValues.join(', '));
}

// For demonstration purposes, the mode toggle doesn't affect the form behavior in this example.
  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const rawValue = this.productForm.getRawValue();
    if (rawValue.price === null || rawValue.stock === null) {
      return;
    }

    const product = new FormData();
    product.append('title', rawValue.title ?? '');
    product.append('description', rawValue.description ?? '');
    product.append('price', String(rawValue.price));
    product.append('sizes', String(rawValue.sizesText ?? ''));
    product.append('stock', String(rawValue.stock));

    if (this.selectedImageFile) {
      product.append('image', this.selectedImageFile);
    }

    

   if (this.activeMode === 'cloud') {
  this.productsService.addProduct(product).subscribe({
    next: (response) => {
      console.log(response);
      this.successMessage = 'Product uploaded successfully!';
     setTimeout(() => {
  this.successMessage = '';
  this.cdr.markForCheck();
}, 3000);
       
      this.resetForm();
    },
    error: () => {
      
  this.errorMessage = 'Failed to upload product';
 
 setTimeout(() => {
  this.errorMessage = '';
  this.cdr.markForCheck();
}, 3000);
      
    }
  });
} else {
  
  const localProduct = new FormData();
  localProduct.append('title', rawValue.title ?? '');
  localProduct.append('description', rawValue.description ?? '');
  localProduct.append('price', String(rawValue.price));
  localProduct.append('sizes', String(rawValue.sizesText ?? ''));
  localProduct.append('stock', String(rawValue.stock));
  console.log('Submitting local product:', Array.from(localProduct.entries()));

  if (this.selectedImageFile) {
    localProduct.append('image', this.selectedImageFile);
  }

  this.localProductesService.addProduct(localProduct).subscribe({
    next: () => {
      this.successMessage = 'Product saved locally!';
      this.resetForm();
      setTimeout(() => {
  this.successMessage = '';
  this.cdr.markForCheck();
}, 3000);
    },
    error: () => {
      this.errorMessage = 'Failed to save local product';
      setTimeout(() => {
  this.errorMessage = '';
  this.cdr.markForCheck();
}, 3000);
    }
  });
}
  }
// For demonstration purposes, the mode toggle doesn't affect the form behavior in this example.
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file) {
      this.selectedImageFile = file;
      this.selectedImageName = file.name;
      return;
    }

    this.clearSelectedImage();
  }

  private clearSelectedImage(): void {
    this.selectedImageFile = null;
    this.selectedImageName = '';

    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }
}
