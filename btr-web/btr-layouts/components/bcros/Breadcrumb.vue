<template>
  <div id="bcros-breadcrumb" class="bg-blue-350" data-cy="breadcrumb">
    <div class="flex flex-wrap divide-x divide-white mx-auto py-[7px] px-4 h-[45px] w-full max-w-[1360px] text-white">
      <UButton
        class="mr-3 mt-[1px] px-1 h-[28px] w-[28px] rounded-full"
        color="white"
        :disabled="breadcrumbs.length < 2"
        icon="i-mdi-arrow-left"
        aria-label="back"
        data-cy="crumb-back"
        @click="back()"
      />
      <div class="flex pl-2">
        <div v-for="crumb, i in breadcrumbs" :key="crumb.text" class="ml-1">
          <UButton
            :class="i === breadcrumbs.length - 1 ? 'pointer-events-none': 'underline'"
            color="white"
            :icon="i === breadcrumbs.length - 1 ? '': 'i-mdi-chevron-right'"
            :padded="false"
            size="xs"
            :trailing="true"
            variant="link"
            data-cy="crumb-link"
            @click="navigate(crumb)"
          >
            {{ crumb.text }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ crumbConstructors:(() => BreadcrumbI)[] }>()
const breadcrumbs = computed(() => props.crumbConstructors.map(getCrumb => getCrumb()))
const { redirect } = useBcrosNavigate()
const { navigateTo } = useRouter()

const back = () => {
  const crumbsLength = breadcrumbs.value.length
  const backCrumb = breadcrumbs.value[crumbsLength - 2]
  navigate(backCrumb)
}

const navigate = (breadcrumb: BreadcrumbI): void => {
  if (breadcrumb.to) {
    navigateTo(breadcrumb.to)
  } else if (breadcrumb.href) {
    redirect(breadcrumb.href)
  }
}

</script>
