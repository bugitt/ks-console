REPO?=kubespheredev/ks-console-replace

setup:
	docker volume create nodemodules

install:
	docker-compose -f docker-compose.builder.yaml run --rm install

dev:
	docker-compose up

build:
	docker-compose -f docker-compose.builder.yaml run --rm build

yarn-%:
	docker-compose -f docker-compose.builder.yaml run --rm base yarn $*

image:
	rm -rf build && mkdir -p build
	docker build -f Dockerfile.multistage . -t harbor.scs.buaa.edu.cn/kubesphere/ks-console-replace
image-push:
	docker push harbor.scs.buaa.edu.cn/kubesphere/ks-console-replace

update: image image-push
	kubectl rollout restart deployment -n kubesphere-system ks-console-replace