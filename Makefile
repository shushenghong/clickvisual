APP_NAME:=clickvisual
SHELL:=/bin/bash
ROOT:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
APP_PATH=$(ROOT)/api
SCRIPT_PATH:=$(APP_PATH)/../scripts
COMPILE_OUT:=$(APP_PATH)/../bin/$(APP_NAME)
HUB_USER:=clickvisual

debug:
	cd api && go run main.go --config=../config/local.toml

build: build.ui build.dist build.api

docs:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ego gen api $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@egogen --config egogen.yaml
	@echo -e "success \n"

build.api:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@chmod +x $(SCRIPT_PATH)/build/*.sh
	@cd $(APP_PATH) && $(SCRIPT_PATH)/build/gobuild.sh $(APP_NAME) $(COMPILE_OUT)
	@echo -e "\n"

build.dist:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@rm -rf $(APP_PATH)/../api/internal/ui/dist
	@mv $(APP_PATH)/../ui/dist $(APP_PATH)/../api/internal/ui/dist
	@echo -e "\n"

build.ui:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@cd $(APP_PATH)/../ui && yarn install --frozen-lockfile && yarn run build
	@echo -e "\n"

docker:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	docker buildx build --platform linux/amd64,linux/arm64 --push -t docker.open.seastart.cn/vcs/clickvisual:latest .
	@echo -e "\n"

docker.build:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@docker build -t $(HUB_USER)/clickvisual:latest .
	@echo -e "\n"

docker.push:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@docker push $(HUB_USER)/clickvisual:latest
	@echo -e "\n"

docker.clean:
	@echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>making $@<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
	@rm -rf $(ROOT)/data/all-in-one/clickhouse/database
	@rm -rf $(ROOT)/data/all-in-one/kafka/data
	@rm -rf $(ROOT)/data/all-in-one/zookeeper/data
	@rm -rf $(ROOT)/data/all-in-one/zookeeper/datalog
